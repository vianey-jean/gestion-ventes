/**
 * =============================================================================
 * smsService.js — Envoi de SMS (Twilio, optionnel)
 * =============================================================================
 *
 * Le SMS est un canal OPTIONNEL : si les variables TWILIO_* ne sont pas
 * définies dans server/.env, le service se dégrade proprement (dry-run loggé)
 * et le code retourne { simulated: true } au lieu de planter le serveur.
 * Cela permet d'activer le SMS plus tard sans changer le code métier.
 *
 * Configuration nécessaire pour un envoi réel :
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
 *   (npm install twilio — non installé par défaut pour ne pas alourdir le
 *    projet si le SMS n'est pas utilisé)
 *
 * @module services/smsService
 */

let twilioClient = null;
let triedLoadingTwilio = false;

function getTwilioClient() {
  if (twilioClient) return twilioClient;
  if (triedLoadingTwilio) return null;
  triedLoadingTwilio = true;

  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;

  try {
    // Chargement paresseux : le package 'twilio' n'est requis que si le SMS est utilisé.
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const twilio = require('twilio');
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    return twilioClient;
  } catch (e) {
    console.warn('⚠️  Le module "twilio" n\'est pas installé (npm install twilio). SMS désactivé.');
    return null;
  }
}

async function sendSms(to, body) {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!client || !fromNumber) {
    console.warn('⚠️  SMS non configuré (.env / twilio) — SMS simulé (dry-run):');
    console.warn(`    À: ${to} | Message: ${body}`);
    return { simulated: true };
  }

  try {
    const message = await client.messages.create({ to, from: fromNumber, body });
    return { simulated: false, sid: message.sid };
  } catch (error) {
    console.error('❌ Erreur envoi SMS:', error.message);
    throw new Error("Échec de l'envoi du SMS. Veuillez réessayer.");
  }
}

module.exports = {
  sendOtpSms: (to, code, context = 'vérification') =>
    sendSms(to, `Gestion Vente : votre code de ${context} est ${code}. Ce code expire dans quelques minutes.`),

  isConfigured: () => !!getTwilioClient() && !!process.env.TWILIO_FROM_NUMBER,
};
