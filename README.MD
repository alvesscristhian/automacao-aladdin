# Explicação da Arquitetura do Projeto

## Visão Geral

O fluxo completo do sistema é o seguinte:

```text
Mensagem do WhatsApp

↓

processList()

↓

parseMessage()

↓

sortNumbers()

↓

calculateTotal()

↓

generatePDF()

↓

Retorna o PDF gerado
```

Cada função possui apenas uma responsabilidade. Isso segue um dos princípios mais importantes do desenvolvimento de software: o Single Responsibility Principle (Princípio da Responsabilidade Única).

---

# 1 - parserService.js

Suponha que o usuário envie a seguinte mensagem:

```text
Lista número 05

Centena

306*** 3,00 reais
304*** 3,00 reais
305*** 3,00 reais

Milhar

7945*** 10,00 reais
6919*** 10,00 reais
```

O JavaScript recebe tudo isso como uma única string:

```javascript
const message = `
Lista número 05

Centena
...
`;
```

Trabalhar diretamente com uma string grande não é muito prático, então utilizamos um parser.

## O que ele faz?

Transforma isso:

```text
Lista número 05

Centena

304*** 3,00 reais
```

nisso:

```javascript
{
    lista: 5,

    centena: [
        {
            number: "304***",
            value: 3
        }
    ],

    milhar: []
}
```

---

## Entendendo esse trecho

```javascript
const lines = message
    .split("\n")
    .map(line => line.trim())
    .filter(line => line !== "");
```

### split()

Transforma a mensagem em um array:

```javascript
[
    "Lista número 05",
    "",
    "",
    "Centena",
    "",
    "",
    "304*** 3,00 reais"
]
```

### map()

Remove espaços em branco no início e no final das linhas.

### filter()

Remove as linhas vazias:

```javascript
[
    "Lista número 05",
    "Centena",
    "304*** 3,00 reais"
]
```

Agora fica muito mais fácil percorrer as informações.

---

## O for

```javascript
for (const line of lines)
```

Ele percorre linha por linha:

```javascript
line = "Lista número 05"

↓

line = "Centena"

↓

line = "304*** 3,00 reais"
```

---

## Pegando o número da lista

```javascript
const number = line.match(/\d+/);
```

Entrada:

```text
Lista número 05
```

Saída:

```text
05
```

Então fazemos:

```javascript
result.lista = 5;
```

---

## Identificando a seção

Quando encontra:

```text
Centena
```

o parser faz:

```javascript
currentSection = "centena";
```

Quando encontra:

```text
Milhar
```

faz:

```javascript
currentSection = "milhar";
```

Assim sabemos em qual array salvar os números.

---

## Pegando os números

Entrada:

```text
304*** 3,00 reais
```

A Regex:

```javascript
const regex = /(\d+\*+)\s+([\d,.]+)/;
```

separa:

```text
304***

↓

3,00
```

Resultado:

```javascript
{
    number: "304***",
    value: 3
}
```

que é salvo no array correspondente.

---

# 2 - sortService.js

Suponha que recebemos:

```javascript
[
    {
        number: "306***"
    },
    {
        number: "304***"
    }
]
```

Queremos ordenar em ordem crescente:

```javascript
[
    {
        number: "304***"
    },
    {
        number: "305***"
    },
    {
        number: "306***"
    }
]
```

### Removendo os asteriscos

```javascript
replace(/\*/g, '')
```

Transforma:

```text
304***
```

em:

```text
304
```

### Convertendo para número

```javascript
parseInt()
```

Transforma:

```javascript
"304"
```

em:

```javascript
304
```

Agora conseguimos utilizar:

```javascript
sort()
```

para ordenar normalmente.

---

# 3 - totalService.js

Temos os seguintes valores:

```text
Centena:

3
3
3

Milhar:

10
10
```

Precisamos somar tudo.

### Utilizando reduce()

```javascript
array.reduce()
```

Na prática é semelhante a:

```javascript
let total = 0;

for (item of array) {
    total += item.value;
}
```

Resultado:

```text
29
```

---

# 4 - pdfService.js

O pdfService possui apenas uma responsabilidade: gerar PDFs.

Ele recebe:

```javascript
{
    lista: 5,

    centena: [...],

    milhar: [...],

    total: 29
}
```

E gera algo semelhante a:

```text
Lista número 05

CENTENA

304*** - R$ 3,00
305*** - R$ 3,00
306*** - R$ 3,00

MILHAR

6919*** - R$ 10,00
7945*** - R$ 10,00

----------------------

TOTAL

R$ 29,00
```

Observe que ele NÃO sabe:

- Ordenar números;
- Fazer contas;
- Ler mensagens do WhatsApp.

Ele apenas gera PDFs.

Essa separação de responsabilidades é extremamente importante.

---

# 5 - listController.js

O listController é o cérebro da aplicação.

```javascript
processList()
```

Ele funciona como um gerente.

Ele não realiza nenhuma tarefa específica, apenas coordena o fluxo da aplicação:

```javascript
Parser, faça seu trabalho.

↓

Sort, faça seu trabalho.

↓

Total, faça seu trabalho.

↓

PDF, faça seu trabalho.
```

Exemplo:

```javascript
async function processList(message) {
    ...
}
```

Ele é responsável apenas por orquestrar as outras funções.

---

# Por que essa arquitetura é interessante?

Imagine que amanhã as mensagens sejam recebidas pelo Telegram ao invés do WhatsApp.

O que muda?

```javascript
const message = telegram.message;
```

Todo o restante do sistema permanece exatamente igual.

---

Outro exemplo:

O cliente quer gerar uma planilha Excel ao invés de um PDF.

Basta substituir:

```javascript
generatePDF();
```

por:

```javascript
generateExcel();
```

Todo o restante continua funcionando normalmente.

---

# Conceito mais importante do projeto

Sempre pense em responsabilidades bem definidas.

| Arquivo | Responsabilidade |
|--------|--------|
| parserService | Ler e organizar a mensagem recebida |
| sortService | Ordenar os números |
| totalService | Calcular o valor total |
| pdfService | Gerar o PDF |
| listController | Controlar o fluxo da aplicação |
| whatsappService (futuro) | Receber e enviar mensagens do WhatsApp |
| main.js | Ponto de entrada do sistema |

---

# Conclusão

Essa separação é exatamente a mesma abordagem utilizada em projetos profissionais.

As principais vantagens são:

- Código mais organizado;
- Fácil manutenção;
- Fácil implementação de novas funcionalidades;
- Componentes independentes;
- Maior facilidade para testes;
- Facilidade para trocar tecnologias no futuro.

A regra é simples:

> Cada arquivo deve fazer apenas uma coisa, e fazê-la bem.

Isso torna o projeto muito mais escalável e fácil de evoluir no futuro.