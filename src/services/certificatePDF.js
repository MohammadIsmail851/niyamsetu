import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { formatDate } from '@/utils';

export const generateCertificatePDF = async (certificate) => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;

  // ── Background ───────────────────────────────────────────────────────────
  pdf.setFillColor(7, 26, 61); // Navy
  pdf.rect(0, 0, pageW, 42, 'F');

  // ── Decorative border ─────────────────────────────────────────────────────
  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(1.5);
  pdf.rect(8, 8, pageW - 16, pageH - 16);
  pdf.setDrawColor(200, 210, 230);
  pdf.setLineWidth(0.4);
  pdf.rect(10, 10, pageW - 20, pageH - 20);

  // ── Government Header ─────────────────────────────────────────────────────
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('GOVERNMENT OF INDIA', pageW / 2, 16, { align: 'center' });
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Ministry of Consumer Affairs, Food and Public Distribution', pageW / 2, 22, { align: 'center' });
  pdf.text('Department of Consumer Affairs — Legal Metrology Division', pageW / 2, 27, { align: 'center' });

  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text('NIYAMSETU', pageW / 2, 35, { align: 'center' });

  // ── Certificate Title ─────────────────────────────────────────────────────
  pdf.setTextColor(7, 26, 61);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('CERTIFICATE OF VERIFICATION', pageW / 2, 58, { align: 'center' });

  pdf.setDrawColor(37, 99, 235);
  pdf.setLineWidth(0.8);
  pdf.line(40, 62, pageW - 40, 62);

  pdf.setFontSize(8.5);
  pdf.setFont('helvetica', 'italic');
  pdf.setTextColor(100, 116, 139);
  pdf.text('Issued under the Legal Metrology Act, 2009 & Legal Metrology (General) Rules, 2011', pageW / 2, 68, { align: 'center' });

  // ── Certificate Number ─────────────────────────────────────────────────────
  pdf.setFillColor(219, 234, 254);
  pdf.roundedRect(14, 73, pageW - 28, 14, 3, 3, 'F');
  pdf.setTextColor(29, 78, 216);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Certificate No: ${certificate.certificateNumber}`, pageW / 2, 81, { align: 'center' });
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Verification ID: ${certificate.verificationId || '—'}`, pageW / 2, 84, { align: 'center' });

  // ── Section helper ────────────────────────────────────────────────────────
  const drawSection = (title, y) => {
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(14, y, pageW - 28, 6, 2, 2, 'F');
    pdf.setTextColor(7, 26, 61);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, 18, y + 4.2);
    return y + 8;
  };

  const drawField = (label, value, x, y, colW = 87) => {
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(label, x, y);
    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text(value || '—', x, y + 4.5, { maxWidth: colW - 4 });
  };

  // ── Owner / Business Section ─────────────────────────────────────────────
  let y = drawSection('BUSINESS INFORMATION', 92);
  drawField('Owner Name', certificate.ownerName, 18, y + 3);
  drawField('Business Name', certificate.businessName, 105, y + 3);
  drawField('GST Number', certificate.gstNumber || '—', 18, y + 13);
  drawField('Address', certificate.address || '—', 105, y + 13, 90);
  y += 28;

  // ── Instrument Section ───────────────────────────────────────────────────
  y = drawSection('INSTRUMENT DETAILS', y);
  drawField('Instrument Type', certificate.instrumentType, 18, y + 3);
  drawField('Category', certificate.category, 105, y + 3);
  drawField('Manufacturer', certificate.manufacturer, 18, y + 13);
  drawField('Model Number', certificate.modelNumber, 105, y + 13);
  drawField('Serial Number', certificate.serialNumber, 18, y + 23);
  drawField('Capacity', certificate.capacity, 105, y + 23);
  y += 38;

  // ── Verification Section ─────────────────────────────────────────────────
  y = drawSection('VERIFICATION DETAILS', y);
  drawField('Verification Date', formatDate(certificate.verificationDate), 18, y + 3);
  drawField('Valid Until', formatDate(certificate.validUntil), 105, y + 3);
  drawField('Verification Type', certificate.verificationType || 'Subsequent Verification', 18, y + 13);
  drawField('Verification Result', 'PASSED ✓', 105, y + 13);
  y += 28;

  // ── Officer Section ──────────────────────────────────────────────────────
  y = drawSection('ISSUING AUTHORITY', y);
  drawField('Officer Name', certificate.officerName || '—', 18, y + 3);
  drawField('Designation', 'Legal Metrology Officer', 105, y + 3);
  drawField('District', certificate.district || '—', 18, y + 13);
  drawField('State', certificate.state || '—', 105, y + 13);
  y += 28;

  // ── QR Code ──────────────────────────────────────────────────────────────
  const verifyUrl = `${window.location.origin}/verify/${certificate.certificateNumber}`;
  const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
    width: 200, margin: 1,
    color: { dark: '#071A3D', light: '#FFFFFF' },
  });

  pdf.addImage(qrDataUrl, 'PNG', pageW / 2 - 22, y + 2, 44, 44);
  pdf.setTextColor(100, 116, 139);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Scan to verify authenticity', pageW / 2, y + 50, { align: 'center' });
  pdf.text(verifyUrl, pageW / 2, y + 55, { align: 'center' });

  // ── Valid badge ──────────────────────────────────────────────────────────
  pdf.setFillColor(220, 252, 231);
  pdf.roundedRect(14, y + 2, 75, 18, 3, 3, 'F');
  pdf.setDrawColor(34, 197, 94);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(14, y + 2, 75, 18, 3, 3, 'S');
  pdf.setTextColor(21, 128, 61);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('✓  VERIFIED AUTHENTIC', 26, y + 13);

  // ── Footer ────────────────────────────────────────────────────────────────
  pdf.setFillColor(7, 26, 61);
  pdf.rect(0, pageH - 18, pageW, 18, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'normal');
  pdf.text('This is a digitally generated certificate. Verify authenticity at niyamsetu.gov.in/verify', pageW / 2, pageH - 10, { align: 'center' });
  pdf.text(`Generated: ${formatDate(new Date(), 'dd MMM yyyy HH:mm')}  |  NIYAMSETU — National Verification Platform`, pageW / 2, pageH - 5, { align: 'center' });

  pdf.save(`${certificate.certificateNumber}.pdf`);
};
