const path = require('path');
const fs = require('fs');
const pino = require('pino');
const {
  default: makeWASocket,
  useSingleFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} = require('@whiskeysockets/baileys');
const processList = require('../controllers/listController');

const authFile = path.resolve('./auth_info_multi.json');

async function startWhatsApp() {
  const { state, saveState } = useSingleFileAuthState(authFile);
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    logger: pino({ level: 'info' }),
    printQRInTerminal: true,
    auth: state,
    version,
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const status = lastDisconnect?.error?.output?.statusCode;
      if (status === DisconnectReason.loggedOut) {
        console.log('Logout detectado. Refaça o login no WhatsApp.');
      } else {
        console.log('Conexão fechada, reconectando...', lastDisconnect?.error);
        startWhatsApp();
      }
    }

    if (connection === 'open') {
      console.log('WhatsApp conectado com sucesso.');
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const text =
      msg.message.conversation ||
      msg.message?.extendedTextMessage?.text ||
      msg.message?.imageMessage?.caption;

    if (!text || !sender) return;

    try {
      console.log('Mensagem recebida de', sender);
      const result = await processList(text);

      if (result.success && result.pdfPath) {
        await sendPdf(sender, result.pdfPath, sock);
      } else {
        await sock.sendMessage(sender, {
          text: 'Não consegui gerar o PDF. Verifique o formato da mensagem.',
        });
      }
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      await sock.sendMessage(sender, {
        text: 'Ocorreu um erro ao processar sua lista. Tente novamente.',
      });
    }
  });

  return sock;
}

async function sendPdf(jid, pdfPath, sock) {
  const buffer = await fs.promises.readFile(pdfPath);

  await sock.sendMessage(jid, {
    document: buffer,
    mimetype: 'application/pdf',
    fileName: path.basename(pdfPath),
    caption: 'Aqui está o PDF gerado da sua lista.',
  });
}

module.exports = startWhatsApp;