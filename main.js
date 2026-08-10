const startWhatsApp = require('./src/services/whatsappService');

async function main() {
  await startWhatsApp();
}

main().catch((error) => {
  console.error('Erro ao iniciar WhatsApp:', error);
  process.exit(1);
});