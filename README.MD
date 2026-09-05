# Automação Aladdin

## Visão Geral

Este projeto recebe uma lista enviada por WhatsApp, processa as linhas, gera um PDF e envia o arquivo de volta ao remetente.

O fluxo é:

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
enviar PDF de volta pelo WhatsApp
```

## Estrutura principal

- `src/controllers/listController.js` — orquestra o processamento da lista
- `src/services/parserService.js` — converte o texto em objetos
- `src/services/sortService.js` — ordena números
- `src/services/totalService.js` — calcula total
- `src/services/pdfService.js` — gera o PDF
- `src/services/whatsappService.js` — integra com `@whiskeysockets/baileys`

## Requisitos

- Node.js compatível com a versão usada no projeto
- Dependências instaladas com `npm install`

## Como rodar

1. Instale as dependências:

```bash
npm install
```

2. Inicie o bot:

```bash
npm start
```

3. Abra o terminal e escaneie o QR code exibido com o WhatsApp do número que irá receber as mensagens.

> Após a primeira autenticação bem-sucedida, o estado fica salvo em `auth_info` e você não precisará escanear o QR novamente.

## Mensagem de teste

Envie para o número conectado uma mensagem no formato:

```text
Lista número 01

Centena
304*** 3,00 reais
305*** 4,50 reais

Milhar
7945*** 10,00 reais
6919*** 10,00 reais
```

Também são aceitas listas de terno de grupo:

```text
Lista número 04

TERNO DE GRUPO
100,00 reais *** Camelo/Macaco/Vaca
10,00 reais *** Coelho/Macaco/Pavão
```

Cada linha deve conter um valor, três animais separados por `/` e pode terminar com ponto.

## O que acontece depois

- o bot lê a mensagem recebida via WhatsApp
- processa o texto usando `processList()` e gera os dados estruturados
- calcula o valor total
- gera o PDF em `pdf/lista-01.pdf`
- envia o PDF de volta como documento pelo WhatsApp
- inclui no caption o valor total calculado

## Logs úteis

- o bot mostra apenas logs próprios para manter a saída limpa
- sincronização de histórico antigo é ignorada
- a pasta `auth_info` guarda o estado de login
- em logout, `auth_info` é removida automaticamente para forçar novo QR

O bot usa logs próprios para manter a saída limpa e informativa:

- `[Aladdin WhatsApp] QR code gerado...`
- `[Aladdin WhatsApp] Aguardando leitura do QR...`
- `[Aladdin WhatsApp] Conectando ao WhatsApp...`
- `[Aladdin WhatsApp] WhatsApp conectado com sucesso.`
- `[Aladdin WhatsApp] PDF enviado para <jid> | Total: R$ XX.XX`

## Observações

- A pasta `auth_info` contém o estado de autenticação do WhatsApp.
- Em caso de logout, o diretório é removido automaticamente para forçar um novo login.
- O projeto foi configurado para não sincronizar histórico antigo.

## Teste manual sem WhatsApp

Se precisar testar apenas o parser e o PDF, chame `processList(message)` diretamente em `main.js` com uma string de exemplo.

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

    ternoGrupo: [...],

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