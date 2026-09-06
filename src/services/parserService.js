module.exports = function parseMessage(message) {
    const result = {
        lista: null,
        centena: [],
        milhar: [],
        ternoGrupo: [],
    };

    const lines = message
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '');

    let currentSection = null;
    let pendingGroupValue = null;

    for (const line of lines) {
        const normalizedLine = line.toLowerCase();

        const groupOnlyMatch = line.match(
            /^([^/\s]+\s*\/\s*[^/\s]+\s*\/\s*[^/\s]+)\s*\.?$/i,
        );

        if (pendingGroupValue !== null && groupOnlyMatch) {
            const group = groupOnlyMatch[1]
                .replace(/[.,]$/, '')
                .split('/')
                .map((animal) => animal.trim())
                .filter(Boolean);

            if (group.length === 3) {
                result.ternoGrupo.push({
                    group: group.join('/'),
                    value: pendingGroupValue,
                });
            }

            pendingGroupValue = null;
            continue;
        }

        if (pendingGroupValue !== null) {
            pendingGroupValue = null;
        }

        // Lista número XX ou "Centenas - lista 3 / A"
        if (normalizedLine.includes('lista') && !normalizedLine.includes('total')) {
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

        // TERNO DE GRUPO: 100,00 reais *** Camelo/Macaco/Vaca
        if (normalizedLine.includes('terno de grupo')) {
            currentSection = 'ternoGrupo';
            continue;
        }

        const groupMatch = line.match(
            /^([\d.,]+)\s+reais?\s+\*+\s*([^/\s]+\s*\/\s*[^/\s]+\s*\/\s*[^/\s]+)\s*\.?$/i,
        );

        if (groupMatch) {
            const group = groupMatch[2]
                .replace(/[.,]$/, '')
                .split('/')
                .map((animal) => animal.trim())
                .filter(Boolean);

            if (group.length === 3) {
                result.ternoGrupo.push({
                    group: group.join('/'),
                    value: Number(groupMatch[1].replace(',', '.')),
                });
            }

            continue;
        }

        const groupValueOnlyMatch = line.match(
            /^([\d.,]+)\s+reais?\s+\*+\s*$/i,
        );

        if (groupValueOnlyMatch) {
            pendingGroupValue = Number(
                groupValueOnlyMatch[1].replace(',', '.'),
            );
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