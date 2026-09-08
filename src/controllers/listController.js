const parseMessage = require('../services/parserService');
const sortNumbers = require('../services/sortService');
const calculateTotal = require('../services/totalService');
const generatePDF = require('../services/pdfService');

async function processList(message) {
    const parsed = parseMessage(message);

    parsed.dezena = sortNumbers(
        parsed.dezena,
    );

    parsed.centena = sortNumbers(
        parsed.centena,
    );

    parsed.milhar = sortNumbers(
        parsed.milhar,
    );

    parsed.ternoGrupo = parsed.ternoGrupo || [];

    parsed.total = calculateTotal(parsed);

    const pdfPath = await generatePDF(parsed);

    return {
        success: true,
        pdfPath,
        data: parsed,
    };
}

module.exports = processList;