import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ApprovalQueue, ApprovalQueueStatus } from "libs/database/src/entities/approval-queue.entity";
import { Course } from "libs/database/src/entities/course.entity";
import { User } from "libs/database/src/entities/user.entity";
import { Repository } from "typeorm";
import { UpdateApprovalStatusDto } from "./dto/update-approval-status.dto";
import { Payout } from "libs/database/src/entities/payout.entity";
import { Commission } from "libs/database/src/entities/commission.entity";
import { CommissionHelper } from "libs/common/src/utils/commission/commission.helper";
import { UpdatePayoutStatusDto } from "./dto/update-payout-status.dto";
import { UpdateInstuctorAmountDto } from "./dto/update-instructor-amount.dto";
import { Admin } from "libs/database/src/entities/admin.entity";


@Injectable()
export class ApprovalQueueService {
    constructor(
        @InjectRepository(ApprovalQueue)
        private readonly approvalQueueRepository: Repository<ApprovalQueue>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Payout)
        private readonly payoutRepository: Repository<Payout>,
        @InjectRepository(Commission)
        private readonly commissionRepository: Repository<Commission>,
        private readonly commissionHelper: CommissionHelper
    ) {}

    async getApprovalList() {
        try {
            const approvalQueueList = await this.approvalQueueRepository
                .createQueryBuilder('queue')
                .leftJoinAndMapOne('queue.instructor', User, 'instructor', 'instructor.id = queue.instructorId')
                .leftJoinAndMapOne('queue.admin', Admin, 'admin', 'admin.id = queue.instructorId')
                .leftJoinAndMapOne('queue.course', Course, 'course', 'course.id = queue.courseId')
                .leftJoinAndMapOne('queue.buyer', User, 'user', 'user.id = queue.buyerId')
                .orderBy('queue.soldOn', 'DESC')
                .getMany()

            if(!approvalQueueList || !approvalQueueList.length) return { status: false, statusCode: 200, message: 'No Approval Request found', data: [] }    

            // Fetch commission info
            const approvalQueueWithCommission = await Promise.all(
                approvalQueueList.map(async (queue) => {
                    const { platformShare, instructorShare } = await this.commissionHelper.getInstructorCommission(queue.instructorId!)
                    return {
                        ...queue,
                        commission: {
                            platformShare,
                            instructorShare
                        }
                    }
                })
            )

            return {
                status: true,
                statusCode: 200,
                message: 'Approval Queue List Fetched',
                data: approvalQueueWithCommission
            }
        } catch (error: any) {
            console.error('---------error', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException(error.message);               
        }
    }

    async approveQueueRequest(dto: UpdateApprovalStatusDto) {
        try {
            const approval = await this.approvalQueueRepository.findOne({ where: { id: dto.requestId }})
            if (!approval) throw new BadRequestException('Record not found');

            approval.status = dto.status
            await this.approvalQueueRepository.save(approval)

            if(dto.status == ApprovalQueueStatus.APPROVED) {
                const instructor = await this.userRepository.findOne({ where: { id: approval.instructorId }})
                if (instructor) {
                    instructor.walletBalance = (instructor.walletBalance ?? 0) + Number(approval.instructorAmount)
                    await this.userRepository.save(instructor)
                }
            }

            return {
                status: true,
                statusCode: 200,
                message: 'Approval Status updated',
                data: approval
            }
        } catch (error: any) {
            console.error('---------error', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException(error.message);               
        }
    }

    async getPayoutRequestList() {
        try {
            const payoutList = await this.payoutRepository
                .createQueryBuilder('payout')
                .leftJoinAndMapOne('payout.instructor', User, 'instructor', 'instructor.id = payout.userId')
                .leftJoinAndMapOne('payout.admin', Admin, 'admin', 'admin.id = payout.userId')
                .orderBy('payout.requestedAt', 'DESC')
                .getMany()

            if(!payoutList || !payoutList.length) return { status: false, statusCode: 200, message: 'No payouts request found'}
            
            return {
                status: true,
                statusCode: 200,
                message: 'Payouts request fetched successfully',
                data: payoutList
            }    
        } catch (error: any) {
            console.error('---------error', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException(error.message);               
        }
    }

    async approvePayoutRequest(dto: UpdatePayoutStatusDto) {
        try {
            const payout = await this.payoutRepository.findOne({ where: { id: dto.payoutId }})
            if(!payout) throw new BadRequestException('Record not found')

            payout.status = dto.status
            await this.payoutRepository.save(payout)

            return {
                status: true,
                statusCode: 200,
                message: 'Payout status updated',
                data: payout
            }
        } catch (error: any) {
            console.error('---------error', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException(error.message);                   
        }
    }

    async modifyInstructorAmount(dto: UpdateInstuctorAmountDto) {
        try {
            const approvalQueue: any = await this.approvalQueueRepository.findOne({ where: { id: dto.queueId }})
            if(!approvalQueue) throw new BadRequestException('Record not found')

             approvalQueue.instructorAmount = dto.instructorAmount
             
             await this.approvalQueueRepository.save(approvalQueue)

             return {
                status: true,
                statusCode: 200,
                message: 'Instructor Amount updated',
                data: approvalQueue                
             }
        } catch (error: any) {
            console.error('---------error', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
            throw new InternalServerErrorException(error.message);              
        }
    }
}