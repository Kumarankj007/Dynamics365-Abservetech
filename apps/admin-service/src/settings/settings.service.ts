import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { response } from "express";
import { Settings } from "libs/database/src/entities/settings.entity";
import { Repository } from "typeorm";
import { UpdateSettingsDto } from "./dto/update-settings.dto";


@Injectable()
export class SettingsService {
    constructor(
        @InjectRepository(Settings)
        private readonly settingsRepository: Repository<Settings>
    ) { }
    async getSettings() {
        try {
            let settings = await this.settingsRepository.find({
                order: { id: 'ASC' },
                take: 1
            }).then(res => res[0])
            if (!settings) settings = await this.settingsRepository.save({})

            return {
                status: true,
                statusCode: 200,
                message: 'Settings Fetched successfully',
                data: settings
            }
        } catch (error: any) {
            console.error('---------error', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException(error.message);
        }
    }
    async getSmtp() {
        const settings = await this.settingsRepository.find({
            order: { id: 'ASC' },
            take: 1,
        });

        return settings[0]?.smtp;
    }

    async getStripeWebhookSecret(): Promise<string> {
        const settings = await this.settingsRepository.find({
            order: { id: 'ASC' },
            take: 1,
        });

        const secret = settings[0]?.stripeWebhookSecret;

        if (!secret) {
            throw new Error('Stripe webhook secret not configured');
        }

        return secret;
    }

    async updateSettings(
        dto: UpdateSettingsDto,
        logoUrl?: string,
        faviconUrl?: string,
    ) {
        try {
            const result = await this.getSettings();
            const settings = result.data;

            for (const key of Object.keys(dto)) {
                let value = (dto as any)[key];

                if (value === undefined || value === '') continue;

                if (key === 'smtp' && typeof value === 'string') {
                    try {
                        value = JSON.parse(value);
                    } catch {
                        throw new BadRequestException(
                            'Invalid JSON for smtp field. Example: {"host":"smtp.com","port":587,"user":"a","pass":"b"}',
                        );
                    }
                }

                // ✅ ASSIGN FOR ALL KEYS
                (settings as any)[key] = value;
            }

            if (logoUrl) settings.logo = logoUrl;
            if (faviconUrl) settings.favicon = faviconUrl;

            await this.settingsRepository.save(settings);

            return {
                status: true,
                statusCode: 200,
                message: 'Settings updated successfully',
                data: settings,
            };
        } catch (error: any) {
            console.error('---------error', error);
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException ||
                error instanceof UnauthorizedException
            ) {
                throw error;
            }
            throw new InternalServerErrorException(error.message);
        }
    }

}