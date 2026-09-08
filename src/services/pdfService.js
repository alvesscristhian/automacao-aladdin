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

function writeGroupedGroups(doc, items) {
    groupByValue(items).forEach((group, value) => {
        doc.text(`Valor: R$ ${value.toFixed(2)}`);

        group.forEach((item) => {
            doc.text(`  (${item.group})`);
        });

        doc.moveDown(0.5);
    });
}

function writeSection(doc, title, items, writer) {
    if (items.length === 0) return;

    doc.text(title);
    writer(doc, items);
    doc.moveDown();
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

        if (data.dezena.length > 0) {
            doc.text('Dezenas:');
            writeGroupedItems(doc, data.dezena);
        }

        if (data.centena.length > 0) {
            doc.text('Centenas:');
            writeGroupedItems(doc, data.centena);
        }

        if (data.milhar.length > 0) {
            doc.text('Milhares:');
            writeGroupedItems(doc, data.milhar);
        }

        if (data.ternoGrupo && data.ternoGrupo.length > 0) {
            doc.text('Ternos de Grupo:');
            writeGroupedGroups(doc, data.ternoGrupo);
        }

        doc.moveDown();

        doc.text('--------------------------------');

        doc.text(`Total: R$ ${data.total.toFixed(2)}`);

        doc.end();
    });
};