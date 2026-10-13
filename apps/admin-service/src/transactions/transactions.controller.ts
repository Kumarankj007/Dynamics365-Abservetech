import { Controller, Get, Query, Res, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { TransactionsService } from "./transactions.service";
import { TransactionsDto } from "./dto/transactions.dto";
import { Response } from "express";
import { buildCsv, sendExcel } from "libs/common/src/utils/export/export.util";
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';

@ApiTags('Transactions')
@Controller("transactions")
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get()
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  async getTransactions(@Query() query: TransactionsDto) {
    return this.service.getTransactions(query);
  }

  @Get("export")
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Export transactions as CSV or Excel" })
  async export(@Query() filter: TransactionsDto, @Res() res: Response) {
    const format = filter.export || "csv";

    // fetch ALL filtered rows
    const rows = await this.service.getAllForExport(filter);

    const now = new Date();
    const filenameBase = `transactions_${now
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}`;

    if (format === "excel") {
      const filename = `${filenameBase}.xlsx`;
      await sendExcel(rows, filename, res);
      return;
    } else {
      const csv = buildCsv(rows);
      const filename = `${filenameBase}.csv`;

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`
      );

      res.send(csv);
      return;
    }
  }
}
