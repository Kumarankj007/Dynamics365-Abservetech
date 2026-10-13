import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PayoutService } from "./payout.service";
import { JwtAuthGuard } from "libs/access/src/guards/jwt-auth.guard";
import { RolesGuard } from "libs/access/src/guards/roles.guard";
import { CurrentUser, Roles } from "libs/access/src/decorators/roles.decorator";
import { Role } from "libs/access/src/enums/roles.enum";
import { PayoutDto } from "./dto/payout.dto";

@ApiTags('Payout')
@Controller('payout')
export class PayoutController {
    constructor(
        private readonly payoutService: PayoutService
    ) {}
    @Post('/request')
    @ApiOperation({ summary: 'Create a payout request' })
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR)
    async createPayoutRequest(@CurrentUser() user: { userId: string }, @Body() dto: PayoutDto) {
        return this.payoutService.createPayout(user.userId, dto)
    }

    @Get('/list')
    @ApiOperation({ summary: 'Get list of payout requests for the current user' })
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.INSTRUCTOR)
    async getPayoutRequests(@CurrentUser() user: { userId:string }) {
        return this.payoutService.fetchPayoutsByUser(user.userId)
    }
}