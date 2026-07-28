const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

module.exports = function generatePDF(data) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const outputDir = path.resolve(__dirname, '..', 'pdf');
        const filePath = path.join(outputDir, `lista-${data.lista}.pdf`);

        fs.mkdirSync(outputDir, { recursive: true });

        const writeStream = fs.createWriteStream(filePath);

        writeStream.on('error', reject);
        writeStream.on('finish', () => resolve(filePath));
        doc.on('error', reject);

        doc.pipe(writeStream);

        doc.fontSize(18);
        doc.text(`Lista número ${data.lista}`);

        doc.moveDown();

        doc.fontSize(14);
        doc.text('CENTENA');

        data.centena.forEach((item) => {
            doc.text(`${item.number} - R$ ${item.value.toFixed(2)}`);
        });

        doc.moveDown();

        doc.text('MILHAR');

        data.milhar.forEach((item) => {
            doc.text(`${item.number} - R$ ${item.value.toFixed(2)}`);
        });

        doc.moveDown();

        doc.text('--------------------------------');

        doc.text(`Total: R$ ${data.total.toFixed(2)}`);

        doc.end();
    });
};