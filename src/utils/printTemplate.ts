import { CompanySettings } from "@/hooks/useSettings";

const numberToWords = (num: number): string => {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

  if (num === 0) return 'Zero';
  
  const convert = (n: number): string => {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + convert(n % 10000000) : '');
  };

  return convert(Math.floor(num));
};

export const generateInvoicePrintHTML = (invoice: any, companySettings: CompanySettings): string => {
  const subtotal = invoice.subtotal || 0;
  const taxAmount = invoice.tax_amount || 0;
  const totalAmount = invoice.total_amount || invoice.amount || 0;
  const cgstAmount = taxAmount / 2;
  const sgstAmount = taxAmount / 2;
  const taxRate = invoice.tax_type === 'IGST' ? 18 : 9; // 18% IGST or 9% CGST + 9% SGST
  
  const amountInWords = numberToWords(Math.floor(totalAmount));

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice - ${invoice.invoice_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px; 
          font-size: 12px;
          line-height: 1.4;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { 
          font-size: 24px; 
          margin-bottom: 15px; 
          text-decoration: underline;
        }
        .company-details {
          text-align: center;
          margin-bottom: 20px;
        }
        .company-details h2 {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          padding: 10px 0;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
        }
        .bill-to { margin-bottom: 15px; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
        }
        th, td { 
          border: 1px solid #000; 
          padding: 8px; 
          text-align: left;
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals-table {
          width: 100%;
          margin-top: 20px;
        }
        .totals-table td {
          border: 1px solid #000;
          padding: 6px;
        }
        .amount-words {
          margin: 20px 0;
          padding: 10px;
          border: 1px solid #000;
        }
        .bank-details {
          margin: 20px 0;
        }
        .bank-table {
          width: 50%;
        }
        .signature {
          text-align: right;
          margin-top: 60px;
          padding-right: 40px;
        }
        .bold { font-weight: bold; }
        @media print {
          body { padding: 10px; }
          @page { margin: 0.5cm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>TAX INVOICE</h1>
      </div>

      <div class="company-details">
        <h2>${companySettings.name || 'ARTISAN APPARELS'}</h2>
        <p>${companySettings.address || 'HIG 9A, APHB Colony, Adoni'}</p>
        <p>GSTIN No - ${companySettings.taxNumber || '37AGDPR6197G1ZW'}</p>
      </div>

      <div class="invoice-info">
        <div class="bill-to">
          <p><strong>Bill to:</strong> ${invoice.customer_name || invoice.customer?.name || 'Customer'}</p>
          <p>${invoice.customer_phone || invoice.customer?.phone || invoice.customer?.mobile || invoice.customer?.contact?.phone || ''}</p>
          <p>${invoice.customer_email || invoice.customer?.email || invoice.customer?.contact?.email || ''}</p>
          <p>${invoice.customer_address || invoice.customer?.address || invoice.customer?.billing_address || invoice.customer?.contact?.address || ''}</p>
          <p>${invoice.customer_gst_no || invoice.customer?.gst_no || invoice.customer?.gst || invoice.customer?.gstin || invoice.customer?.tax_id || ''}</p>
        </div>
        <div>
          <p><strong>INVOICE No:</strong> ${invoice.invoice_number}</p>
          <p><strong>Dated:</strong> ${invoice.invoice_date || invoice.date}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description of Goods</th>
            <th class="text-center">HSN CODE</th>
            <th class="text-center">QTY</th>
            <th class="text-center">Units</th>
            <th class="text-right">RATE (Incl of Tax)</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${(invoice.items || []).map((item: any) => `
            <tr>
              <td>${item.description || ''}</td>
              <td class="text-center">${item.hsn_code || 'Shirts'}</td>
              <td class="text-center">${item.quantity || 0}</td>
              <td class="text-center">${item.unit || 'Pcs'}</td>
              <td class="text-right">${(item.rate || 0).toFixed(2)}</td>
              <td class="text-right">${(item.amount || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <table class="totals-table">
        <tr>
          <td colspan="5" class="text-right bold">Total:</td>
          <td class="text-right bold">${subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="5" class="text-right">Discount:</td>
          <td class="text-right">0.00</td>
        </tr>
        <tr>
          <td colspan="5" class="text-right bold">Taxable Value:</td>
          <td class="text-right bold">${subtotal.toFixed(2)}</td>
        </tr>
        ${invoice.tax_type === 'IGST' ? `
          <tr>
            <td colspan="5" class="text-right">ADD IGST ${taxRate}%:</td>
            <td class="text-right">${taxAmount.toFixed(2)}</td>
          </tr>
        ` : `
          <tr>
            <td colspan="5" class="text-right">ADD CGST ${taxRate}%:</td>
            <td class="text-right">${cgstAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="5" class="text-right">ADD SGST ${taxRate}%:</td>
            <td class="text-right">${sgstAmount.toFixed(2)}</td>
          </tr>
        `}
        <tr>
          <td colspan="5" class="text-right bold">Total:</td>
          <td class="text-right bold">${totalAmount.toFixed(2)}</td>
        </tr>
      </table>

      <div class="amount-words">
        <strong>Amount Chargeable (in words):</strong> ${amountInWords} Rupees Only
      </div>

      <div class="bank-details">
        <h3>Company's Bank Details</h3>
        <table class="bank-table">
          <tr>
            <td><strong>Holder A/c Name</strong></td>
            <td>${companySettings.accountHolderName || companySettings.name || 'ARTISAN APPARELS'}</td>
          </tr>
          <tr>
            <td><strong>BANK NAME</strong></td>
            <td>${companySettings.bankName || 'HDFC BANK'}</td>
          </tr>
          <tr>
            <td><strong>ACCOUNT No</strong></td>
            <td>${companySettings.accountNumber || '9998019993333'}</td>
          </tr>
          <tr>
            <td><strong>BRANCH</strong></td>
            <td>${companySettings.branchAddress || 'ADONI'}</td>
          </tr>
          <tr>
            <td><strong>IFSC CODE</strong></td>
            <td>${companySettings.routingNumber || 'HDFC0001933'}</td>
          </tr>
        </table>
      </div>
      <div class="signature">
        <p>For ${companySettings.name || 'ARTISAN APPARELS'}</p>
        <br><br>
        <p>Authorised Signatory</p>
      </div>
    </body>
    </html>
  `;
};

export const generateQuotationPrintHTML = (quotation: any, companySettings: CompanySettings): string => {
  const subtotal = quotation.subtotal || 0;
  const taxAmount = quotation.tax_amount || 0;
  const totalAmount = quotation.amount || 0;
  const cgstAmount = taxAmount / 2;
  const sgstAmount = taxAmount / 2;
  const taxRate = quotation.tax_type === 'IGST' ? 18 : 9;
  
  const amountInWords = numberToWords(Math.floor(totalAmount));

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Quotation - ${quotation.quotation_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px; 
          font-size: 12px;
          line-height: 1.4;
        }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { 
          font-size: 24px; 
          margin-bottom: 15px; 
          text-decoration: underline;
        }
        .company-details {
          text-align: center;
          margin-bottom: 20px;
        }
        .company-details h2 {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        .quotation-info {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
          padding: 10px 0;
          border-top: 2px solid #000;
          border-bottom: 2px solid #000;
        }
        .bill-to { margin-bottom: 15px; }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
        }
        th, td { 
          border: 1px solid #000; 
          padding: 8px; 
          text-align: left;
        }
        th { 
          background-color: #f2f2f2; 
          font-weight: bold;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals-table {
          width: 100%;
          margin-top: 20px;
        }
        .totals-table td {
          border: 1px solid #000;
          padding: 6px;
        }
        .amount-words {
          margin: 20px 0;
          padding: 10px;
          border: 1px solid #000;
        }
        .bank-details {
          margin: 20px 0;
        }
        .bank-table {
          width: 50%;
        }
        .signature {
          text-align: right;
          margin-top: 60px;
          padding-right: 40px;
        }
        .bold { font-weight: bold; }
        .validity {
          margin: 15px 0;
          padding: 8px;
          background-color: #f9f9f9;
          border-left: 3px solid #333;
        }
        @media print {
          body { padding: 10px; }
          @page { margin: 0.5cm; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>QUOTATION</h1>
      </div>

      <div class="company-details">
        <h2>${companySettings.name || 'ARTISAN APPARELS'}</h2>
        <p>${companySettings.address || 'HIG 9A, APHB Colony, Adoni'}</p>
        <p>GSTIN No - ${companySettings.taxNumber || '37AGDPR6197G1ZW'}</p>
      </div>

      <div class="quotation-info">
        <div class="bill-to">
          <p><strong>To:</strong><br>${quotation.customer?.name || 'Customer'}</p>
          <p>${quotation.customer?.phone || quotation.customer_phone || quotation.customer?.mobile || quotation.customer?.contact?.phone || ''}</p>
          <p>${quotation.customer?.email || quotation.customer_email || quotation.customer?.contact?.email || ''}</p>
          <p>${quotation.customer?.address || quotation.customer_address || quotation.customer?.billing_address || quotation.customer?.contact?.address || ''}</p>
          <p>${quotation.customer?.gst_no || quotation.customer_gst_no || quotation.customer?.gst || quotation.customer?.gstin || quotation.customer?.tax_id || ''}</p>
        </div>
        <div>
          <p><strong>QUOTATION No:</strong> ${quotation.quotation_number}</p>
          <p><strong>Dated:</strong> ${quotation.date}</p>
        </div>
      </div>

      ${quotation.valid_until ? `
        <div class="validity">
          <strong>Valid Until:</strong> ${quotation.valid_until}
        </div>
      ` : ''}

      <table>
        <thead>
          <tr>
            <th>Description of Goods</th>
            <th class="text-center">HSN CODE</th>
            <th class="text-center">QTY</th>
            <th class="text-center">Units</th>
            <th class="text-right">RATE (Incl of Tax)</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${(quotation.items || []).map((item: any) => `
            <tr>
              <td>${item.description || ''}</td>
              <td class="text-center">${item.hsn_code || 'Shirts'}</td>
              <td class="text-center">${item.quantity || 0}</td>
              <td class="text-center">${item.unit || 'Pcs'}</td>
              <td class="text-right">${(item.rate || 0).toFixed(2)}</td>
              <td class="text-right">${(item.amount || 0).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <table class="totals-table">
        <tr>
          <td colspan="5" class="text-right bold">Total:</td>
          <td class="text-right bold">${subtotal.toFixed(2)}</td>
        </tr>
        <tr>
          <td colspan="5" class="text-right">Discount:</td>
          <td class="text-right">0.00</td>
        </tr>
        <tr>
          <td colspan="5" class="text-right bold">Taxable Value:</td>
          <td class="text-right bold">${subtotal.toFixed(2)}</td>
        </tr>
        ${quotation.tax_type === 'IGST' ? `
          <tr>
            <td colspan="5" class="text-right">ADD IGST ${taxRate}%:</td>
            <td class="text-right">${taxAmount.toFixed(2)}</td>
          </tr>
        ` : `
          <tr>
            <td colspan="5" class="text-right">ADD CGST ${taxRate}%:</td>
            <td class="text-right">${cgstAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="5" class="text-right">ADD SGST ${taxRate}%:</td>
            <td class="text-right">${sgstAmount.toFixed(2)}</td>
          </tr>
        `}
        <tr>
          <td colspan="5" class="text-right bold">Total:</td>
          <td class="text-right bold">${totalAmount.toFixed(2)}</td>
        </tr>
      </table>

      <div class="amount-words">
        <strong>Amount Chargeable (in words):</strong> ${amountInWords} Rupees Only
      </div>

      <div class="bank-details">
        <h3>Company's Bank Details</h3>
        <table class="bank-table">
          <tr>
            <td><strong>Holder A/c Name</strong></td>
            <td>${companySettings.accountHolderName || companySettings.name || 'ARTISAN APPARELS'}</td>
          </tr>
          <tr>
            <td><strong>BANK NAME</strong></td>
            <td>${companySettings.bankName || 'HDFC BANK'}</td>
          </tr>
          <tr>
            <td><strong>ACCOUNT No</strong></td>
            <td>${companySettings.accountNumber || '9998019993333'}</td>
          </tr>
          <tr>
            <td><strong>BRANCH</strong></td>
            <td>${companySettings.branchAddress || 'ADONI'}</td>
          </tr>
          <tr>
            <td><strong>IFSC CODE</strong></td>
            <td>${companySettings.routingNumber || 'HDFC0001933'}</td>
          </tr>
        </table>
      </div>

      <div class="signature">
        <p>For ${companySettings.name || 'ARTISAN APPARELS'}</p>
        <br><br><br>
        <p>Authorised Signatory</p>
      </div>
    </body>
    </html>
  `;
};
