import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Commission } from "libs/database/src/entities/commission.entity";
import { CommissionHelper } from "./commission.helper";


@Module({
    imports: [
        TypeOrmModule.forFeature([Commission]),
    ],
    providers: [CommissionHelper],
    exports: [CommissionHelper]
})

export class CommissionModule {}