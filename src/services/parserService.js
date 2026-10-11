function getSectionByDigits(number) {
    const digitCount = number.replace(/\*/g, '').length;

    if (digitCount === 2) return 'dezena';
    if (digitCount === 3) return 'centena';
    if (digitCount === 4) return 'milhar';
    return null;
}

module.exports = function parseMessage(message) {
    const result = {
        lista: null,
        dezena: [],
        centena: [],
        milhar: [],
        ternoGrupo: [],
    };

    function getRepeatedBet(line) {
        const prizeRange = line.match(
            /(\d+)\s*[º°o]?\s*(?:ao|ate|até|-)\s*(\d+)\s*[º°o]?\s*pr[eê]mios?/i,
        );
        const unitValue = line.match(
            /(?:r\$\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:reais?)?\s+(?:em|para)\s+cada\b/i,
        );

        if (!prizeRange || !unitValue) {
            return null;
        }

        const firstPrize = Number(prizeRange[1]);
        const lastPrize = Number(prizeRange[2]);

        if (lastPrize < firstPrize) {
            return null;
        }

        return {
            prizeCount: lastPrize - firstPrize + 1,
            baseValue: Number(unitValue[1].replace(',', '.')),
        };
    }

    const lines = message
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line !== '');

    let currentSection = null;
    let pendingGroupValue = null;
    let repeatedBet = null;

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

        if (normalizedLine.includes('lista') && !normalizedLine.includes('total')) {
            const number = line.match(/\d+/);

            if (number) {
                result.lista = Number(number[0]);
            }
            if (normalizedLine.includes('dezena')) {
                currentSection = 'dezena';
            } else if (normalizedLine.includes('centena')) {
                currentSection = 'centena';
                repeatedBet = getRepeatedBet(line);
            } else if (normalizedLine.includes('milhar')) {
                currentSection = 'milhar';
                repeatedBet = getRepeatedBet(line);
            } else if (currentSection === null) {
                currentSection = 'centena';
            }

            continue;
        }

        if (normalizedLine === 'dezena' || normalizedLine.includes('dezena')) {
            currentSection = 'dezena';
            repeatedBet = null;
            continue;
        }

        if (normalizedLine === 'centena' || normalizedLine.includes('centena')) {
            currentSection = 'centena';
            repeatedBet = getRepeatedBet(line);
            continue;
        }

        if (normalizedLine === 'milhar' || normalizedLine.includes('milhar')) {
            currentSection = 'milhar';
            repeatedBet = getRepeatedBet(line);
            continue;
        }

        if (normalizedLine.includes('terno de grupo')) {
            currentSection = 'ternoGrupo';
            repeatedBet = null;
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

        const lineRepeatedBet = getRepeatedBet(line);

        if (lineRepeatedBet) {
            repeatedBet = lineRepeatedBet;
        }

        const match = line.match(/(\d+\*+)(?:\s+([\d,.]+))?/);

        if (match) {
            const number = match[1];
            const explicitValue = match[2]
                ? Number(match[2].replace(',', '.'))
                : null;

            if (explicitValue === null && !repeatedBet) {
                continue;
            }

            const item = {
                number,
                value: explicitValue !== null
                    ? explicitValue
                    : Number((repeatedBet.baseValue * repeatedBet.prizeCount).toFixed(2)),
            };

            if (explicitValue === null && repeatedBet) {
                item.baseValue = repeatedBet.baseValue;
                item.prizeCount = repeatedBet.prizeCount;
            }

            const section = getSectionByDigits(number) || currentSection;

            if (section === 'dezena') {
                result.dezena.push(item);
            } else if (section === 'centena') {
                result.centena.push(item);
            } else if (section === 'milhar') {
                result.milhar.push(item);
            }
        }
    }

    return result;
};
