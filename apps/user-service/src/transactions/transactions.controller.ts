import { Controller, Get, Query, Req, UseGuards, UnauthorizedException, Param, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserTransactionsService } from './transactions.service';
import { UserTransactionsDto } from './dto/transactions.dto';
import { JwtAuthGuard } from 'libs/access/src/guards/jwt-auth.guard';
import { Response, Request } from 'express';

@ApiTags('Transactions')
@Controller('transactions')
export class UserTransactionsController {
  constructor(private readonly service: UserTransactionsService) {}

  @Get()
  @ApiBearerAuth('jwt-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user transaction history with filters' })
  async getTransactions(@Query() query: UserTransactionsDto, @Req() req: any) {
  if (!req.user?.userId) throw new UnauthorizedException('User not found in request');
  return this.service.getTransactions(req.user.userId, query);
}

@Get(':id/receipt')
@ApiBearerAuth('jwt-auth')
@UseGuards(JwtAuthGuard)
async downloadReceipt(@Param('id') enrollmentId: string, @Res() res: Response, @Req() req: any) {
  const userId = req.user?.userId;

  const pdfBuffer = await this.service.generateReceiptPdf(userId, enrollmentId);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="receipt_${enrollmentId}.pdf"`);
  res.send(pdfBuffer);
}
}
