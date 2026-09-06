const test = require('node:test');
const assert = require('node:assert/strict');

const parseMessage = require('../src/services/parserService');
const calculateTotal = require('../src/services/totalService');

test('parses terno de grupo entries and includes them in total', () => {
    const parsed = parseMessage(`LISTA NÚMERO 04

TERNO DE GRUPO

100,00 reais *** Camelo/Macaco/Vaca.
10,00 reais *** Coelho/Macaco/Pavão
30,00 reais *** Leão/Coelho/Carneiro

Valor total 140,00 reais`);

    assert.equal(parsed.lista, 4);
    assert.deepEqual(parsed.ternoGrupo, [
        { group: 'Camelo/Macaco/Vaca', value: 100 },
        { group: 'Coelho/Macaco/Pavão', value: 10 },
        { group: 'Leão/Coelho/Carneiro', value: 30 },
    ]);
    assert.equal(calculateTotal(parsed), 140);
});

test('keeps existing centena and milhar parsing', () => {
    const parsed = parseMessage(`Lista número 01

Centena
304*** 3,00 reais

Milhar
7945*** 10,00 reais`);

    assert.deepEqual(parsed.centena, [{ number: '304***', value: 3 }]);
    assert.deepEqual(parsed.milhar, [{ number: '7945***', value: 10 }]);
    assert.deepEqual(parsed.ternoGrupo, []);
    assert.equal(calculateTotal(parsed), 13);
});

test('parses multiline terno de grupo entries', () => {
    const parsed = parseMessage(`Lista número 05

Terno de grupo

100,00 reais ***
Macaco/Jacaré/Vaca

100,00 reais ***
Vaca/Cachorro/Cavalo

Total da lista número 05.

200,00 reais`);

    assert.equal(parsed.lista, 5);
    assert.deepEqual(parsed.ternoGrupo, [
        { group: 'Macaco/Jacaré/Vaca', value: 100 },
        { group: 'Vaca/Cachorro/Cavalo', value: 100 },
    ]);
    assert.equal(calculateTotal(parsed), 200);
});