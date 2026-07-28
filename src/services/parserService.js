module.exports = function parseMessage(message) {
    const result = {
        lista: null,
        centena: [],
        milhar: [],
    };

    const lines = message
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '');

    let currentSection = null;

    for (const line of lines) {
        const normalizedLine = line.toLowerCase();

        // Lista número XX ou "Centenas - lista 3 / A"
        if (normalizedLine.includes('lista')) {
            const number = line.match(/\d+/);

            if (number) {
                result.lista = Number(number[0]);
            }

            if (normalizedLine.includes('centena')) {
                currentSection = 'centena';
            } else if (normalizedLine.includes('milhar')) {
                currentSection = 'milhar';
            } else if (currentSection === null) {
                currentSection = 'centena';
            }

            continue;
        }

        // CENTENA
        if (normalizedLine === 'centena' || normalizedLine.includes('centena')) {
            currentSection = 'centena';
            continue;
        }

        // MILHAR
        if (normalizedLine === 'milhar' || normalizedLine.includes('milhar')) {
            currentSection = 'milhar';
            continue;
        }

        // pega:
        // 304*** 3,00 reais
        const regex = /(\d+\*+)\s+([\d,.]+)/;

        const match = line.match(regex);

        if (match) {
            const number = match[1];

            const value = Number(
                match[2].replace(',', '.')
            );

            const item = {
                number,
                value,
            };

            if (currentSection === 'centena') {
                result.centena.push(item);
            }

            if (currentSection === 'milhar') {
                result.milhar.push(item);
            }
        }
    }

    return result;
}