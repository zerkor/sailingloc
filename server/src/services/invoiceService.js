const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { uploadRoot } = require('../middleware/uploadMiddleware');

const invoiceDir = path.join(uploadRoot, 'invoices');

const ensureInvoiceDir = () => {
  fs.mkdirSync(invoiceDir, { recursive: true });
};

const formatDate = (date) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date));

const formatPrice = (amount) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(Number(amount || 0));

const customerName = (user = {}) => `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client SailingLoc';

const generateInvoiceNumber = (payment) => {
  const year = new Date(payment.paidAt || payment.createdAt || Date.now()).getFullYear();
  return `SL-${year}-${payment._id.toString().slice(-8).toUpperCase()}`;
};

const line = (doc, y) => {
  doc.moveTo(48, y).lineTo(547, y).strokeColor('#d9e3ec').lineWidth(1).stroke();
};

const generateInvoicePdf = async ({ booking, payment }) => {
  ensureInvoiceDir();
  const invoiceNumber = payment.invoiceNumber || generateInvoiceNumber(payment);
  const fileName = `${invoiceNumber}.pdf`;
  const filePath = path.join(invoiceDir, fileName);
  const invoiceUrl = `/uploads/invoices/${fileName}`;

  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: `Facture ${invoiceNumber}` } });
    const stream = fs.createWriteStream(filePath);
    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.on('error', reject);
    doc.pipe(stream);

    doc.rect(0, 0, 595.28, 120).fill('#07192e');
    doc.fillColor('#ffffff').fontSize(28).font('Helvetica-Bold').text('Sailing', 48, 38, { continued: true });
    doc.fillColor('#00c6e0').text('Loc');
    doc.fillColor('#b7c4d3').fontSize(10).font('Helvetica').text('Location de bateaux entre particuliers', 48, 76);

    doc.fillColor('#07192e').fontSize(26).font('Helvetica-Bold').text('Facture', 48, 150);
    doc.fontSize(11).font('Helvetica').fillColor('#66758a').text(`Numero : ${invoiceNumber}`, 48, 186);
    doc.text(`Date : ${formatDate(payment.paidAt || new Date())}`, 48, 204);
    doc.text('Projet etudiant fictif - aucun paiement reel encaisse', 48, 222);

    doc.fillColor('#07192e').fontSize(13).font('Helvetica-Bold').text('Client', 330, 150);
    doc.fillColor('#344256').fontSize(11).font('Helvetica').text(customerName(booking.tenant), 330, 174);
    doc.text(booking.tenant?.email || '-', 330, 192);

    line(doc, 256);

    doc.fillColor('#07192e').fontSize(15).font('Helvetica-Bold').text('Reservation', 48, 284);
    doc.fillColor('#344256').fontSize(11).font('Helvetica').text(`Bateau : ${booking.boat?.title || 'Bateau SailingLoc'}`, 48, 312);
    doc.text(`Lieu : ${booking.boat?.location || '-'}`, 48, 330);
    doc.text(`Periode : ${formatDate(booking.startDate)} au ${formatDate(booking.endDate)}`, 48, 348);
    doc.text(`Nombre de jours : ${booking.numberOfDays}`, 48, 366);

    const tableTop = 418;
    doc.roundedRect(48, tableTop, 499, 42, 8).fill('#edf3f7');
    doc.fillColor('#07192e').fontSize(10).font('Helvetica-Bold');
    doc.text('Description', 66, tableTop + 15);
    doc.text('Quantite', 330, tableTop + 15);
    doc.text('Montant', 452, tableTop + 15);

    doc.fillColor('#344256').fontSize(11).font('Helvetica');
    doc.text(`Location ${booking.boat?.title || ''}`.trim(), 66, tableTop + 64);
    doc.text(`${booking.numberOfDays} jour(s)`, 330, tableTop + 64);
    doc.text(formatPrice(booking.pricePerDay * booking.numberOfDays), 452, tableTop + 64);
    doc.text('Frais de service SailingLoc', 66, tableTop + 94);
    doc.text('1', 330, tableTop + 94);
    doc.text(formatPrice(booking.serviceFee), 452, tableTop + 94);

    line(doc, tableTop + 132);
    doc.font('Helvetica-Bold').fontSize(13).fillColor('#07192e').text('Total TTC', 330, tableTop + 156);
    doc.fontSize(18).text(formatPrice(payment.amount), 452, tableTop + 152);

    doc.roundedRect(48, 690, 499, 54, 10).fill('#e8fbfe');
    doc.fillColor('#007f94').fontSize(10).font('Helvetica-Bold').text('INFORMATION MVP', 66, 708);
    doc
      .fillColor('#344256')
      .fontSize(10)
      .font('Helvetica')
      .text(
        'Cette facture est generee dans le cadre du projet etudiant fictif SailingLoc. Elle ne correspond a aucun achat, paiement ou contrat reel.',
        66,
        724,
        { width: 460 }
      );

    doc.fillColor('#66758a').fontSize(9).text('SailingLoc - contact@sailingloc.fr', 48, 790);
    doc.end();
  });

  return { invoiceNumber, invoiceUrl, filePath };
};

module.exports = { generateInvoicePdf, generateInvoiceNumber };
