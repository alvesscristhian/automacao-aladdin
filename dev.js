const fs = require('fs');
const readline = require('readline/promises');
const processList = require('./src/controllers/listController');

const exampleList = `Lista número 06

Milhar do 1° ao 5° prêmio, a 2,00 reais em cada.


3081***

xxxxxxxxxxxxxxxxxxxx 
Taty Batata

Total 10,00 reais.

Lista número 08

Milhar no 1° prêmio
1221***   3,00 reais
2536***   3,00 reais
3743***   3,00 reais
5268***   3,00 reais
8577***   3,00 reais

xxxxxxxxxxxxxxxxxxxx

Centena no 1° prêmio
221***   3,00 reais
536***   3,00 reais
743***   3,00 reais
268***   3,00 reais
577***   3,00 reais

xxxxxxxxxxxxxxxxxxxx

2° ao 5° prêmio 3,00 reais em cada.
221***
536***
743***
268***
577***

xxxxxxxxxxxxxxxxxxxx

Dezena do 2° ao 5° prêmio 3,00 reais em cada.
21***
36***
43***
68***
77***

xxxxxxxxxxxxxxxxxxxx
Cleyton

Total 150,00 reais`;

async function main() {
    const filePath = process.argv[2];
    let inputMessage = '';

    if (filePath) {
        inputMessage = fs.readFileSync(filePath, 'utf8');
    } else if (process.stdin.isTTY) {
        const terminal = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        const inputPath = await terminal.question(
            'Caminho do arquivo da lista (Enter para usar o exemplo): ',
        );
        terminal.close();

        if (inputPath.trim()) {
            inputMessage = fs.readFileSync(inputPath.trim(), 'utf8');
        }
    } else {
        inputMessage = fs.readFileSync(0, 'utf8');
    }

    const message = inputMessage.trim() || exampleList;

    const result = await processList(message);

    console.log(`PDF gerado: ${result.pdfPath}`);
    console.log(`Lista: ${result.data.lista}`);
    console.log(`Dezenas: ${result.data.dezena.length}`);
    console.log(`Centenas: ${result.data.centena.length}`);
    console.log(`Milhares: ${result.data.milhar.length}`);
    console.log(`Ternos de grupo: ${result.data.ternoGrupo.length}`);
    console.log(`Total: R$ ${result.data.total.toFixed(2)}`);
}

main().catch((error) => {
    console.error('Erro ao gerar PDF:', error.message);
    process.exitCode = 1;
});
