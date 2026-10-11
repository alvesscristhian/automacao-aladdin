const test = require('node:test');
const assert = require('node:assert/strict');
const parseMessage = require('../src/services/parserService');
const calculateTotal = require('../src/services/totalService');

test('multiplica o valor unitário pela quantidade de prêmios de 1º ao 5º', () => {
    const parsed = parseMessage(`Lista número 05

Centena do 1° ao 5° prêmio, 2,00 reais em cada.

642***
643***
546***

Total da lista 30,00 reais. Nippon.`);

    assert.equal(parsed.lista, 5);
    assert.deepEqual(
        parsed.centena.map(({ number, value, baseValue, prizeCount }) => ({
            number,
            value,
            baseValue,
            prizeCount,
        })),
        [
            { number: '642***', value: 10, baseValue: 2, prizeCount: 5 },
            { number: '643***', value: 10, baseValue: 2, prizeCount: 5 },
            { number: '546***', value: 10, baseValue: 2, prizeCount: 5 },
        ],
    );
    assert.equal(calculateTotal(parsed), 30);
});

test('multiplica pelo número de prêmios entre o 2º e o 5º', () => {
    const parsed = parseMessage(`Lista 06
Centena do 2º ao 5º prêmio, 2,50 reais para cada
123***`);

    assert.equal(parsed.centena[0].value, 10);
    assert.equal(parsed.centena[0].baseValue, 2.5);
    assert.equal(parsed.centena[0].prizeCount, 4);
});

test('mantém o processamento de valores informados em cada número', () => {
    const parsed = parseMessage(`Lista número 07
Centena
304*** 3,00 reais
305*** 4,50 reais`);

    assert.equal(parsed.lista, 7);
    assert.deepEqual(
        parsed.centena.map(({ value }) => value),
        [3, 4.5],
    );
    assert.equal(calculateTotal(parsed), 7.5);
});
