const calculateTotal = require('./totalService');

function normalizeNumberKey(value) {
    return String(value || '').trim().replace(/\s+/g, '');
}

function normalizeGroupKey(value) {
    return String(value || '')
        .trim()
        .replace(/[.]+$/g, '')
        .toLowerCase();
}

function mergeSection(items = []) {
    const merged = new Map();

    for (const item of items) {
        const key = normalizeNumberKey(item.number);

        if (!merged.has(key)) {
            merged.set(key, { ...item });
            continue;
        }

        const current = merged.get(key);
        current.value += Number(item.value || 0);
    }

    return Array.from(merged.values());
}

function mergeGroupSection(items = []) {
    const merged = new Map();

    for (const item of items) {
        const key = normalizeGroupKey(item.group);

        if (!merged.has(key)) {
            merged.set(key, { ...item });
            continue;
        }

        const current = merged.get(key);
        current.value += Number(item.value || 0);
    }

    return Array.from(merged.values());
}

function mergeParsedLists(...lists) {
    const base = {
        lista: null,
        listas: [],
        dezena: [],
        centena: [],
        milhar: [],
        ternoGrupo: [],
    };

    for (const list of lists) {
        if (!list) continue;

        const listNumbers = list.listas?.length
            ? list.listas
            : list.lista !== null && list.lista !== undefined
                ? [list.lista]
                : [];

        for (const number of listNumbers) {
            if (!base.listas.some((existing) => String(existing) === String(number))) {
                base.listas.push(number);
            }
        }

        if (base.lista === null && list.lista !== null && list.lista !== undefined) {
            base.lista = list.lista;
        }

        base.dezena.push(...(list.dezena || []));
        base.centena.push(...(list.centena || []));
        base.milhar.push(...(list.milhar || []));
        base.ternoGrupo.push(...(list.ternoGrupo || []));
    }

    base.dezena = mergeSection(base.dezena);
    base.centena = mergeSection(base.centena);
    base.milhar = mergeSection(base.milhar);
    base.ternoGrupo = mergeGroupSection(base.ternoGrupo);
    base.total = calculateTotal(base);

    return base;
}

module.exports = {
    mergeParsedLists,
    mergeSection,
    mergeGroupSection,
};
