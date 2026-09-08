const processList = require('./src/controllers/listController');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Exemplo de lista para teste rápido
const exemploLista = `Lista número 01


01***   37,50 reais 

02***   60,00 reais 

03***   8,00 reais 

04***   9,50 reais 

05***   20,50 reais 

06***   82,50 reais 

07***   102,50 reais 

08***   2,50 reais 

09***   8,00 reais 

10***   103,00 reais 

11***   13,00 reais 

12***   48,00 reais 

13***   35,00 reais 

14***   40,00 reais 

15***   32,00 reais 

16***   25,00 reais 

17***   148,00 reais 

18***   68,00 reais 

19***   107,00 reais 

20***   63,00 reais 

21***   95,50 reais 

22***   158,50 reais 

23***   47,50 reais 

24***   35,50 reais 

25***   27,50 reais 

26***   25,00 reais 

27***   5,00 reais 

28***   7,00 reais 

29***   64,00 reais 

30***   29,00 reais 

31***   34,00 reais 

32***   64,00 reais 

33***   50,00 reais 

34***   37,50 reais 

35***   27,50 reais 

36***   65,00 reais 

37***   35,00 reais 

38***   52,00 reais 

39***   30,00 reais 

40***   20,00 reais 

41***   2,50 reais 

42***   2,50 reais 

43***   2,50 reais 

44***   14,50 reais 

45***   115,00 reais 

46***   42,50 reais 

47***   2,50 reais 

48***   15,00 reais 

49***   49,50 reais 

50***   86,50 reais 

51***   59,00 reais 

52***   44,00 reais 

53***   35,00 reais 

54***   45,00 reais 

55***   72,00 reais 

56***   75,00 reais 

57***   38,50 reais 

58***   20,50 reais 

59***   28,00 reais 

60***   25,50 reais 

61***   5,00 reais 

62***   40,00 reais 

63***   4,50 reais

64***   16,50 reais 

65***   17,50 reais 

66***   34,50 reais 

67***   22,50 reais 

68***   14,50 reais 

69***   107,50 reais 

70***   2,50 reais 

71***   17,50 reais 

72***   61,50 reais 

73***   25,00 reais 

74***   30,00 reais 

75***   82,00 reais 

76***   30,00 reais 

77***   117,50 reais 

78***   27,50 reais

79***   9,50 reais 

80***   7,50 reais 

81***   2,50 reais 

82***   11,50 reais 

83***   15,00 reais 

84***   22,50 reais 

85***   17,50 reais 

86***   12,50 reais 

87***   87,50 reais 

88***    7,50 reais 

89***   31,50 reais 

90***   31,50 reais 

91***   42,00 reais 

92***   19,50 reais 

93***  5,00 reais 

94***   10,00 reais 

95***   5,00 reais 

96***   17,50 reais 

97***   49,50 reais 

98***   11,50 reais 

99***   13,50 reais 

00***   34,50 reais 


xxxxxxxxxxxxxxxxxxxx

Valor da lista 01


3.818,50 reais`

console.log('=== PROCESSADOR DE LISTAS - MODO DEV ===\n');
console.log('Use de duas formas:\n');
console.log('1. Com argumento CLI (arquivo com a lista):');
console.log('   node dev.js < lista.txt\n');
console.log('2. Interativo (cole a lista abaixo e pressione Ctrl+D):\n');
console.log('Ou pressione Enter para usar o exemplo de teste:\n');

let input = '';
let isReadingStdin = false;
let hasReceivedData = false;

// Timeout para modo interativo
const timeout = setTimeout(() => {
    if (!hasReceivedData && process.stdin.isTTY) {
        console.log('\n💡 Usando exemplo automático...\n');
        processarLista(exemploLista).then(() => process.exit(0));
    }
}, 100);

// Verifica se há dados sendo piped
if (!process.stdin.isTTY) {
    isReadingStdin = true;
    process.stdin.on('data', (chunk) => {
        hasReceivedData = true;
        clearTimeout(timeout);
        input += chunk.toString();
    });

    process.stdin.on('end', async () => {
        clearTimeout(timeout);
        if (input.trim()) {
            await processarLista(input);
        } else {
            console.log('💡 Nenhuma entrada detectada. Usando exemplo:\n');
            await processarLista(exemploLista);
        }
        process.exit(0);
    });
} else {
    // Modo interativo TTY
    rl.question('Digite a lista (ou deixe em branco para usar exemplo): ', async (answer) => {
        clearTimeout(timeout);
        rl.close();
        if (answer.trim() === '') {
            await processarLista(exemploLista);
        } else {
            await processarLista(answer);
        }
        process.exit(0);
    });
}

async function processarLista(mensagem) {
    try {
        console.log('\n✓ Processando lista...\n');
        const resultado = await processList(mensagem);
        
        console.log('✓ Sucesso!\n');
        console.log(`📄 PDF gerado: ${resultado.pdfPath}`);
        console.log(`📊 Dados processados:`);
        console.log(`   - Lista: ${resultado.data.lista}`);
        console.log(`   - Dezenas: ${resultado.data.dezena.length}`);
        console.log(`   - Centenas: ${resultado.data.centena.length}`);
        console.log(`   - Milhares: ${resultado.data.milhar.length}`);
        console.log(`   - Ternos de Grupo: ${resultado.data.ternoGrupo.length}`);
        console.log(`   - Total: R$ ${resultado.data.total.toFixed(2)}\n`);
    } catch (error) {
        console.error('❌ Erro ao processar:', error.message);
        process.exit(1);
    }
}
