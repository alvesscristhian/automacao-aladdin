const fs = require('fs');
const readline = require('readline/promises');
const processList = require('./src/controllers/listController');

const exampleList = `Lista número 21


Centena do 2° ao 5° prêmio,  a 2,50 reais em cada. 


147***
282***
159***
470***
989***
488***
351***
223***


xxxxxxxxxxxxxxxxxxxx 
Valdir Rifa

Total 80,00 reais`;

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
