import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { ApprovalQueueService } from "./approvalQueue.service";
import { JwtAuthGuard } from "libs/access/src/guards/jwt-auth.guard";
import { RolesGuard } from "libs/access/src/guards/roles.guard";
import { Roles } from "libs/access/src/decorators/roles.decorator";
import { Role } from "libs/access/src/enums/roles.enum";
import { UpdateApprovalStatusDto } from "./dto/update-approval-status.dto";
import { PayoutStatus } from "libs/database/src/entities/payout.entity";
import { UpdatePayoutStatusDto } from "./dto/update-payout-status.dto";
import { UpdateInstuctorAmountDto } from "./dto/update-instructor-amount.dto";


@ApiTags('Admin Approval Queue')
@Controller('approval-queue')
export class ApprovalQueueController {
    constructor(private readonly approvalQueueSerivce: ApprovalQueueService) {}

    @Get('list')
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async approvalList() {
        return this.approvalQueueSerivce.getApprovalList()
    }

    @Post('update')
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async updateStatus(@Body() body: UpdateApprovalStatusDto) {
        return await this.approvalQueueSerivce.approveQueueRequest(body)
    }

    @Get('payouts')
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async getAllPayoutsRequest() {
        return await this.approvalQueueSerivce.getPayoutRequestList()
    }

    @Post('payout/update')
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async updatePayoutStatus(@Body() body: UpdatePayoutStatusDto) {
        return await this.approvalQueueSerivce.approvePayoutRequest(body)
    }

    @Post('instructor-amt')
    @ApiBearerAuth('jwt-auth')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async editInstructorAmt(@Body() body: UpdateInstuctorAmountDto) {
        return await this.approvalQueueSerivce.modifyInstructorAmount(body)
    }
}