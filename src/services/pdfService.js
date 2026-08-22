const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function groupByValue(items) {
    const groups = new Map();

    items.forEach((item) => {
        if (!groups.has(item.value)) {
            groups.set(item.value, []);
        }

        groups.get(item.value).push(item);
    });

    return groups;
}

function writeGroupedItems(doc, items) {
    groupByValue(items).forEach((group, value) => {
        doc.text(`Valor: R$ ${value.toFixed(2)}`);

        group.forEach((item) => {
            doc.text(`  ${item.number}`);
        });

        doc.moveDown(0.5);
    });
}

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
        writeGroupedItems(doc, data.centena);

        doc.moveDown();

        doc.text('MILHAR');
        writeGroupedItems(doc, data.milhar);

        doc.moveDown();

        doc.text('--------------------------------');

        doc.text(`Total: R$ ${data.total.toFixed(2)}`);

        doc.end();
    });
};