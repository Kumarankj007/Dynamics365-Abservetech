import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Course } from "libs/database/src/entities/course.entity";
import { Payout, PayoutStatus } from "libs/database/src/entities/payout.entity";
import { User } from "libs/database/src/entities/user.entity";
import { Repository } from "typeorm";
import { PayoutDto } from "./dto/payout.dto";

@Injectable()
export class PayoutService {
    constructor(
        @InjectRepository(Payout)
        private readonly payoutRepository: Repository<Payout>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Course)
        private readonly courseRepository: Repository<Course>,
    ) {}

    async generateRequestId() {
        const count = await this.payoutRepository.count();
        const year = new Date().getFullYear();
        const num = (count + 1).toString().padStart(3, '0');
        return `PO-${year}-${num}`;
    }

    async createPayout(userId: string, dto: PayoutDto) {
        try {
            const user = await this.userRepository.findOne({ where: { id: userId } })
            if(!user) throw new BadRequestException('User not found')

            if(user.walletBalance! < dto.amount!) throw new BadRequestException('Insufficient wallet balance');

            if(dto.amount! < 50) throw new BadRequestException('Minimum payout amount is $50');

            const requestId = await this.generateRequestId()

            const payout = this.payoutRepository.create({
                userId,
                amount: dto.amount,
                description: dto.description,
                availableToPay: dto.amount,
                requestId,
                status: PayoutStatus.REQUESTED
            })
            await this.payoutRepository.save(payout)

            user.walletBalance! -= dto.amount!
            await this.userRepository.save(user)

            return {
                status: true,
                statusCode: 201,
                message: 'Payout request created successfully',
                data: payout
            }
        } catch (error: any) {
            console.error('---------error', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException(error.message);              
        }
    }

    async fetchPayoutsByUser(userId: string) {
        try {
            const payouts = await this.payoutRepository.find({ where: { userId: userId }, order: { requestedAt: 'DESC' } })
            if(!payouts || !payouts.length) return { status: false, statusCode: 200, message: 'No Payouts found', data: []}

            return {
                status: true,
                statusCode: 200,
                message: 'Payouts fetched successfully',
                data: payouts
            }    
        } catch (error: any) {
            console.error('---------error', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException(error.message);   
        }
    }
}