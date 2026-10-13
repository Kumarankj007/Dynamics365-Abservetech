import { TransactionRow } from 'apps/admin-service/src/transactions/transactions.service';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';

export function buildCsv(rows: TransactionRow[]): string {
  const header = [
    'Student Name',
    'Instructor Name',
    'Course Name',
    'Transaction Date',
    'Payment Source',
    // 'Gross Amount',
    // 'Fee',
    'Net Amount',
    'Next Renewal',
    'Status',
  ];
  const lines = [header.join(',')];

  for (const r of rows) {
    const line = [
      escapeCsv(r.studentName),
      escapeCsv(r.instructorName),
      escapeCsv(r.courseName),
      r.transactionDate ? new Date(r.transactionDate).toISOString() : '',
      escapeCsv(r.paymentSource),
      // formatNumber(r.grossAmount),
      // formatNumber(r.fee),
      formatNumber(r.netAmount),
      r.nextRenewal ? new Date(r.nextRenewal).toISOString() : '',
      escapeCsv(r.status),
    ].join(',');
    lines.push(line);
  }

  return lines.join('\n');
}

function escapeCsv(s: string) {
  if (!s) return '';
  if (s.includes('"') || s.includes(',') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function formatNumber(n: number) {
  if (n === null || n === undefined) return '';
  return n.toFixed(2);
}

export async function sendExcel(rows: TransactionRow[], filename: string, res: Response) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Transactions');

  sheet.columns = [
    { header: 'Student Name', key: 'studentName', width: 30 },
    { header: 'Instructor Name', key: 'instructorName', width: 30 },
    { header: 'Course Name', key: 'courseName', width: 40 },
    { header: 'Transaction Date', key: 'transactionDate', width: 24 },
    { header: 'Payment Source', key: 'paymentSource', width: 18 },
    // { header: 'Gross Amount', key: 'grossAmount', width: 14 },
    // { header: 'Fee', key: 'fee', width: 12 },
    { header: 'Net Amount', key: 'netAmount', width: 14 },
    { header: 'Next Renewal', key: 'nextRenewal', width: 20 },
    { header: 'Status', key: 'status', width: 14 },
  ];

  rows.forEach(r => {
    sheet.addRow({
      studentName: r.studentName,
      instructorName: r.instructorName,
      courseName: r.courseName,
      transactionDate: r.transactionDate ? new Date(r.transactionDate).toISOString() : '',
      paymentSource: r.paymentSource,
      // grossAmount: r.grossAmount,
      // fee: r.fee,
      netAmount: r.netAmount,
      nextRenewal: r.nextRenewal ? new Date(r.nextRenewal).toISOString() : '',
      status: r.status,
    });
  });

  // const grossCol = sheet.getColumn('grossAmount');
  // const feeCol = sheet.getColumn('fee');
  const netCol = sheet.getColumn('netAmount');
  try {
    // grossCol.numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
    // feeCol.numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
    netCol.numFmt = '"$"#,##0.00;[Red]\-"$"#,##0.00';
  } catch (e) {
    // ignore formatting issues
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  await workbook.xlsx.write(res);
  res.end();
}
