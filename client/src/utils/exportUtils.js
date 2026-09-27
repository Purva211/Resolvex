import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Clean & format string values for export
 */
function cleanText(text) {
  return String(text || '').replace(/"/g, '""');
}

/**
 * Export Complaint List to CSV
 */
export function exportToCSV(complaints = [], filename = 'ResolveX_Complaint_Report.csv') {
  if (!complaints.length) return;

  const headers = ['Complaint ID', 'Title', 'Category', 'Priority', 'Department', 'Status', 'SLA Hours', 'Customer Name', 'Customer Email', 'Assigned Agent', 'Created Date'];

  const rows = complaints.map(c => [
    `"${cleanText(c.complaintId)}"`,
    `"${cleanText(c.title)}"`,
    `"${cleanText(c.category)}"`,
    `"${cleanText(c.priority)}"`,
    `"${cleanText(c.department)}"`,
    `"${cleanText(c.status)}"`,
    `"${c.slaHours || 48}"`,
    `"${cleanText(c.customer?.name)}"`,
    `"${cleanText(c.customer?.email)}"`,
    `"${cleanText(c.assignedTo?.name || 'Unassigned')}"`,
    `"${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Complaint List to Excel (.xls / .xlsx format via XML Spreadsheet)
 */
export function exportToExcel(complaints = [], filename = 'ResolveX_Complaint_Report.xls') {
  if (!complaints.length) return;

  let tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Complaint Report</x:Name>
              <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
      <style>
        th { background-color: #4f46e5; color: #ffffff; font-weight: bold; font-family: sans-serif; }
        td { font-family: sans-serif; font-size: 11pt; }
        .priority-HIGH, .priority-CRITICAL { color: #dc2626; font-weight: bold; }
        .status-RESOLVED { color: #16a34a; font-weight: bold; }
      </style>
    </head>
    <body>
      <h2>ResolveX — Customer Complaint Management Report</h2>
      <p>Generated on: ${new Date().toLocaleString()}</p>
      <table border="1">
        <thead>
          <tr>
            <th>Complaint ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Department</th>
            <th>Status</th>
            <th>SLA Hours</th>
            <th>Customer Name</th>
            <th>Customer Email</th>
            <th>Assigned Agent</th>
            <th>Created Date</th>
          </tr>
        </thead>
        <tbody>
  `;

  complaints.forEach(c => {
    tableHtml += `
      <tr>
        <td><b>${c.complaintId || ''}</b></td>
        <td>${c.title || ''}</td>
        <td>${c.category || ''}</td>
        <td class="priority-${c.priority}">${c.priority || ''}</td>
        <td>${c.department || ''}</td>
        <td class="status-${c.status}">${c.status || ''}</td>
        <td>${c.slaHours || 48}</td>
        <td>${c.customer?.name || ''}</td>
        <td>${c.customer?.email || ''}</td>
        <td>${c.assignedTo?.name || 'Unassigned'}</td>
        <td>${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}</td>
      </tr>
    `;
  });

  tableHtml += `
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Complaint List to PDF Report with jsPDF
 */
export function exportToPDF(complaints = [], filename = 'ResolveX_Complaint_Report.pdf') {
  if (!complaints.length) return;

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header Branding
  doc.setFillColor(15, 23, 42); // Dark slate (#0f172a)
  doc.rect(0, 0, 297, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ResolveX', 14, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('Customer Complaint Management System — Executive Report', 50, 16);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 220, 16);

  // Summary Metrics
  const total = complaints.length;
  const openCount = complaints.filter(c => ['NEW', 'ASSIGNED', 'IN_PROGRESS'].includes(c.status)).length;
  const resolvedCount = complaints.filter(c => ['RESOLVED', 'CLOSED'].includes(c.status)).length;
  const criticalCount = complaints.filter(c => c.priority === 'CRITICAL').length;

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Total Tickets: ${total}   |   Open: ${openCount}   |   Resolved/Closed: ${resolvedCount}   |   Critical Priority: ${criticalCount}`, 14, 35);

  // Table Data
  const tableHead = [['ID', 'Title', 'Category', 'Priority', 'Department', 'Status', 'SLA', 'Customer', 'Agent', 'Created']];
  const tableRows = complaints.map(c => [
    c.complaintId || '',
    String(c.title || '').slice(0, 30),
    c.category || '',
    c.priority || '',
    c.department || '',
    c.status || '',
    `${c.slaHours || 48}h`,
    c.customer?.name ? String(c.customer.name).slice(0, 16) : '',
    c.assignedTo?.name ? String(c.assignedTo.name).slice(0, 16) : 'Unassigned',
    c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
  ]);

  autoTable(doc, {
    startY: 40,
    head: tableHead,
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14 }
  });

  doc.save(filename);
}
