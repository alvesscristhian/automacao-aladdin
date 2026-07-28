const processList = require('./src/controllers/listController');

const message = `
Lista número 01


01***   45,00 reais 

02***   57,50 reais 

03***   12,50 reais 

04***   22,00 reais 

05***   62,50 reais 

06***   72,50 reais 

07***   104,50 reais 

08***   2,50 reais 

09***   5,00 reais 

10***   110,00 reais 

11***   10,00 reais 

12***   20,00 reais 

13***   59,50 reais 

14***   34,50 reais 

15***   34,50 reais 

16***   29,50 reais 

17***   142,50 reais 

18***   52,50 reais 

19***   84,50 reais 

20***   57,50 reais 

21***   38,00 reais 

22***   144,00 reais 

23***   68,00 reais 

24***   25,00 reais 

25***   39,50 reais 

26***   27,00 reais 

27***  7,00 reais 

28***   11,50 reais 

29***   70,00 reais 

30***   30,00 reais 

31***   30,50 reais 

32***   62,00 reais 

33***   29,50 reais 

34***   39,50 reais 

35***   77,00 reais 

36***   24,50 reais 

37***   3,00 reais 

38***   40,00 reais 

39***   23,00 reais 

40***   20,50 reais 

41***   7,50 reais 

42***   7,50 reais 

43***   7,50 reais 

44***   24,50 reais 

45***   107,00 reais 

46***   42,50 reais 

47***   22,50 reais 

48***   5,00 reais 

49***   41,00 reais 

50***   26,00 reais 

51***   41,00 reais 

52***   21,00 reais 

53***   48,00 reais 

54***   28,00 reais 

55***   53,00 reais 

56***   55,00 reais 

57***   46,50 reais 

58***   21,00 reais 

59***   35,50 reais 

60***   33,50 reais 

62***   27,50 reais 

64***   14,00 reais 

65***   55,00 reais 

66***   40,00 reais 

67***   22,00 reais 

68***   20,00 reais 

69***   107,50 reais 

70***   12,50 reais 

71***   2,50 reais 

72***   21,50 reais 

73***   33,00 reais 

74***   23,00 reais 

75***   75,00 reais 

76***   23,00 reais 

77***   122,50 reais 

78***   37,00 reais 

79***   15,00 reais 

80***   52,50 reais 

81***   2,50 reais 

82***   10,50 reais 

83***   12,50 reais 

84***   2,50 reais 

85***   27,50 reais 

86***   30,00 reais 

87***   57,50 reais 

88***   17,50 reais 

89***   31,50 reais 

90***   32,50 reais 

91***   45,00 reais 

92***   22,50 reais 

93***   5,00 reais 

94***   45,00 reais 

95***   95,00 reais 

96***   20,00 reais 

97***   19,50 reais 

98***   21,50 reais 

99***   39,50 reais 

00***   21,50 reais 


xxxxxxxxxxxxxxxxxxxx

Valor da lista 01


3.764,50 reais
`;

async function main() {
    const result = await processList(
        message,
    );

    console.log(result);
}

main();