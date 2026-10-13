import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Commission } from "libs/database/src/entities/commission.entity";
import { Repository } from "typeorm";


@Injectable()
export class CommissionHelper {
    constructor(
        @InjectRepository(Commission)
        private readonly commissionRepository: Repository<Commission>
    ) {}

    async getInstructorCommission(instructorId: string) {
        const commissions = await this.commissionRepository.find()

        const commission = commissions
            .filter(c => !c.effectiveFrom || new Date(c.effectiveFrom) <= new Date())
            .sort((a, b) => new Date(b.effectiveFrom || 0).getTime() - new Date(a.effectiveFrom || 0).getTime())[0];

        let platformShare = Number(commission.platformShareDefault);
        let instructorShare = Number(commission.instructorShareDefault);

        const override = commission.premiumInstructorOverrides?.find((o) => o.instructorId == instructorId && (!o.effectiveFrom || new Date(o.effectiveFrom) <= new Date()))
        if(override) {
            platformShare = Number(override.platformShare)
            instructorShare = Number(override.instructorShare)
        }
        return { platformShare, instructorShare }
    }
}