import { Body, Controller, Get, Put, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from "@nestjs/swagger";
import { SettingsService } from "./settings.service";
import { JwtAuthGuard } from "libs/access/src/guards/jwt-auth.guard";
import { RolesGuard } from "libs/access/src/guards/roles.guard";
import { Roles } from "libs/access/src/decorators/roles.decorator";
import { Role } from "libs/access/src/enums/roles.enum";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { UpdateSettingsDto } from "./dto/update-settings.dto";


@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) {}

    @ApiOperation({ summary: 'Fetch settings' })
    @Get()
    async getSettings() {
        return this.settingsService.getSettings()
    }

    @ApiOperation({ summary: 'Update settings' })
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @UseInterceptors(FileFieldsInterceptor([{ name: 'logo', maxCount: 1 }, { name: 'favicon', maxCount: 1 }]))
    @Roles(Role.ADMIN)
    @Put('update')
    async updateSettings(@Body() body: UpdateSettingsDto, @UploadedFiles() files: { logo?: Express.Multer.File[]; favicon?: Express.Multer.File[] }) {
        const logoPath = files.logo?.[0].path || undefined
        const faviconPath = files.favicon?.[0].path || undefined

        return this.settingsService.updateSettings(body, logoPath, faviconPath)
        
    }
}