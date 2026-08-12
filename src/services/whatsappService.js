const path = require('path');
const fs = require('fs');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  proto,
} = require('@whiskeysockets/baileys');
const processList = require('../controllers/listController');

// Diretório local onde as credenciais de sessão do WhatsApp são armazenadas.
const authFolder = path.resolve('./auth_info');

// Função de log para deixar as mensagens no terminal consistentes.
const log = (message) => console.log(`[Aladdin WhatsApp] ${message}`);

// ID do WhatsApp liberado para conversar com o bot.
// O valor real vindo do Baileys pode chegar como "130442653130811@lid".
const ALLOWED_WHATSAPP_ID = '130442653130811@lid';

function normalizeWhatsAppId(jid = '') {
  return String(jid || '').trim().toLowerCase();
}

function isAllowedSender(jid = '') {
  return normalizeWhatsAppId(jid) === ALLOWED_WHATSAPP_ID;
}

async function startWhatsApp() {
  // Carrega a sessão do WhatsApp a partir de arquivos locais.
  // Se a pasta auth_info não existir, o Baileys cria automaticamente.
  const { state, saveCreds } = await useMultiFileAuthState(authFolder);
  const { version } = await fetchLatestBaileysVersion();

  // Cria o socket do WhatsApp com logging minimalista e sem histórico antigo.
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    version,
    syncFullHistory: false,
  });

  // Salva credenciais sempre que elas forem atualizadas.
  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Quando o QR é gerado, mostramos no terminal para o usuário escanear.
    if (qr) {
      log('QR code gerado. Escaneie com o WhatsApp:');
      qrcode.generate(qr, { small: true });
      log('Aguardando leitura do QR...');
    }

    if (connection === 'connecting') {
      log('Conectando ao WhatsApp...');
    }

    if (connection === 'open') {
      log('WhatsApp conectado com sucesso.');
    }

    // Quando a conexão fecha, tratamos logout ou erro de reconexão.
    if (connection === 'close') {
      const status = lastDisconnect?.error?.output?.statusCode;
      if (status === DisconnectReason.loggedOut) {
        log('Logout detectado. Reiniciando sessão para gerar novo QR.');
        try {
          fs.rmSync(authFolder, { recursive: true, force: true });
          log('auth_info removido com sucesso. Reiniciando para novo login...');
        } catch (err) {
          log(`Falha ao remover auth_info: ${err.message}`);
        }
        setTimeout(() => startWhatsApp(), 1000);
      } else {
        log(`Conexão fechada (${status || 'sem status'}). Tentando reconectar em 2 segundos...`);
        setTimeout(() => startWhatsApp(), 2000);
      }
    }
  });

  // Ignora sincronizações de histórico antigas ou recentes.
  sock.ev.on('history.sync', (sync) => {
    if (sync?.syncType === proto.HistorySync.HistorySyncType.RECENT) {
      log('Descobrimos uma sincronização de histórico recente, ignorando.');
      return;
    }
  });

  // Recebe apenas mensagens novas que não sejam de nós mesmos.
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

    if (!isAllowedSender(sender)) {
      log(`Mensagem ignorada de ${sender}. Número não autorizado.`);
      return;
    }

    try {
      log(`Mensagem recebida de ${sender}`);
      const result = await processList(text);

      if (result.success && result.pdfPath) {
        await sendPdf(sender, result.pdfPath, result.data.total, sock);
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

async function sendPdf(jid, pdfPath, total, sock) {
  // Lê o arquivo PDF gerado e envia como documento pelo WhatsApp.
  const buffer = await fs.promises.readFile(pdfPath);
  const formattedTotal = Number(total || 0).toFixed(2);

  await sock.sendMessage(jid, {
    document: buffer,
    mimetype: 'application/pdf',
    fileName: path.basename(pdfPath),
    caption: `Olá! Tudo bem? O Aladdin trouxe a lista solicitada pelo Sr.Carlos. Total: R$ ${formattedTotal}`,
  });

  log(`PDF enviado para ${jid} | Total: R$ ${formattedTotal}`);
}

module.exports = startWhatsApp;