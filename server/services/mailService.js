/**
 * =============================================================================
 * mailService.js — Envoi des emails transactionnels
 * =============================================================================
 *
 * Configuration via server/.env :
 *
 *   SMTP_HOST=
 *   SMTP_PORT=587
 *   SMTP_SECURE=false
 *   SMTP_USER=
 *   SMTP_PASS=
 *
 *   MAIL_FROM=
 *   MAIL_FROM_NAME=Gestion Vente
 *
 * Optionnel :
 *
 *   SMTP_TLS_REJECT_UNAUTHORIZED=true
 *   SMTP_CA_PATH=
 *
 * Pour un serveur SMTP avec certificat auto-signé en développement :
 *
 *   SMTP_TLS_REJECT_UNAUTHORIZED=false
 *
 * ⚠️ Ne pas utiliser SMTP_TLS_REJECT_UNAUTHORIZED=false en production.
 * =============================================================================
 */

const nodemailer = require('nodemailer');
const fs = require('fs');

let transporter = null;
let smtpConfigured = false;
let smtpVerified = false;

/**
 * Convertit une variable d'environnement en booléen.
 */
function envBoolean(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  return String(value).toLowerCase() === 'true';
}

/**
 * Retourne le transporter SMTP.
 */
function getTransporter() {
  if (transporter) {
    return transporter;
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
    SMTP_TLS_REJECT_UNAUTHORIZED,
    SMTP_CA_PATH,
  } = process.env;

  // ---------------------------------------------------------------------------
  // SMTP non configuré
  // ---------------------------------------------------------------------------

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    smtpConfigured = false;
    smtpVerified = false;

    console.warn(
      '⚠️ SMTP non configuré (.env) — mode dry-run activé.'
    );

    return null;
  }

  const port = parseInt(SMTP_PORT, 10) || 587;

  /**
   * SMTP_SECURE :
   *
   * Port 465 => généralement true
   * Port 587 => généralement false
   * Port 25  => généralement false
   */
  const secure =
    SMTP_SECURE !== undefined
      ? envBoolean(SMTP_SECURE)
      : port === 465;

  // ---------------------------------------------------------------------------
  // Configuration TLS
  // ---------------------------------------------------------------------------

  const tls = {};

  /**
   * Par défaut Node.js vérifie le certificat.
   *
   * SMTP_TLS_REJECT_UNAUTHORIZED=false permet de tester un SMTP
   * avec certificat auto-signé.
   *
   * ⚠️ À éviter en production.
   */
  if (SMTP_TLS_REJECT_UNAUTHORIZED !== undefined) {
    tls.rejectUnauthorized = envBoolean(
      SMTP_TLS_REJECT_UNAUTHORIZED,
      true
    );
  } else {
    tls.rejectUnauthorized = true;
  }

  /**
   * Certificat CA personnalisé.
   *
   * Exemple :
   * SMTP_CA_PATH=/app/certs/smtp-ca.pem
   */
  if (SMTP_CA_PATH) {
    try {
      tls.ca = fs.readFileSync(SMTP_CA_PATH);

      console.log(
        `🔐 Certificat CA SMTP chargé : ${SMTP_CA_PATH}`
      );
    } catch (error) {
      console.error(
        `❌ Impossible de charger SMTP_CA_PATH (${SMTP_CA_PATH}):`,
        error.message
      );

      throw new Error(
        'Certificat CA SMTP introuvable ou illisible.'
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Création du transporter
  // ---------------------------------------------------------------------------

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure,

    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },

    tls,

    /**
     * Timeout de connexion.
     */
    connectionTimeout: 15000,

    /**
     * Timeout après connexion.
     */
    greetingTimeout: 15000,

    /**
     * Timeout d'envoi.
     */
    socketTimeout: 20000,
  });

  smtpConfigured = true;

  console.log(
    `📧 SMTP configuré : ${SMTP_HOST}:${port} | secure=${secure}`
  );

  return transporter;
}

/**
 * Vérifie la connexion SMTP.
 *
 * Cette fonction est volontairement séparée de getTransporter()
 * pour éviter de bloquer le démarrage du serveur.
 */
async function verifySmtp() {
  const t = getTransporter();

  if (!t) {
    return false;
  }

  try {
    await t.verify();

    smtpVerified = true;

    console.log('✅ Connexion SMTP vérifiée avec succès.');

    return true;
  } catch (error) {
    smtpVerified = false;

    console.error(
      '❌ Vérification SMTP échouée :',
      error.message
    );

    return false;
  }
}

/**
 * Nom affiché de l'expéditeur.
 */
const FROM_NAME = () =>
  process.env.MAIL_FROM_NAME || 'Gestion Vente';

/**
 * Adresse de l'expéditeur.
 */
const FROM_ADDRESS = () =>
  process.env.MAIL_FROM ||
  process.env.SMTP_USER ||
  'no-reply@gestion-ventes.local';

/**
 * Template HTML pour les emails OTP.
 */
function otpEmailTemplate({
  code,
  title,
  intro,
  appName,
}) {
  return `
  <div style="
    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
    max-width:480px;
    margin:0 auto;
    padding:24px;
    background:#f8fafc;
  ">

    <div style="
      background:#ffffff;
      border-radius:12px;
      padding:32px;
      box-shadow:0 1px 3px rgba(0,0,0,0.08);
    ">

      <h2 style="
        color:#111827;
        margin:0 0 8px;
      ">
        ${title}
      </h2>

      <p style="
        color:#4b5563;
        font-size:14px;
        line-height:1.5;
      ">
        ${intro}
      </p>

      <div style="
        text-align:center;
        margin:28px 0;
      ">

        <span style="
          display:inline-block;
          font-size:32px;
          font-weight:700;
          letter-spacing:8px;
          color:#7c3aed;
          background:#f3e8ff;
          padding:16px 24px;
          border-radius:10px;
        ">
          ${code}
        </span>

      </div>

      <p style="
        color:#6b7280;
        font-size:13px;
      ">
        Ce code expire dans quelques minutes.
        Ne le partagez avec personne, y compris avec notre support.
      </p>

      <p style="
        color:#9ca3af;
        font-size:12px;
        margin-top:24px;
      ">
        Si vous n'êtes pas à l'origine de cette demande,
        ignorez simplement cet email.
      </p>

    </div>

    <p style="
      text-align:center;
      color:#9ca3af;
      font-size:12px;
      margin-top:16px;
    ">
      ${appName}
    </p>

  </div>
  `;
}

/**
 * Envoie un email.
 */
async function dispatch({
  to,
  subject,
  html,
  text,
}) {
  const t = getTransporter();

  // ---------------------------------------------------------------------------
  // Mode dry-run
  // ---------------------------------------------------------------------------

  if (!t) {
    console.warn(
      '⚠️ SMTP non configuré — email simulé (dry-run).'
    );

    console.warn(`   À       : ${to}`);
    console.warn(`   Sujet   : ${subject}`);
    console.warn(`   Contenu : ${text}`);

    return {
      simulated: true,
      messageId: null,
    };
  }

  // ---------------------------------------------------------------------------
  // Envoi
  // ---------------------------------------------------------------------------

  try {
    const info = await t.sendMail({
      from: `"${FROM_NAME()}" <${FROM_ADDRESS()}>`,
      to,
      subject,
      html,
      text,
    });

    console.log(
      `✅ Email envoyé à ${to} — messageId=${info.messageId}`
    );

    return {
      simulated: false,
      messageId: info.messageId,
    };

  } catch (error) {
    /**
     * On garde l'erreur technique dans les logs.
     * L'utilisateur reçoit uniquement un message générique.
     */

    console.error('❌ Erreur envoi email');
    console.error('   Code    :', error.code || 'N/A');
    console.error('   Command :', error.command || 'N/A');
    console.error('   Message :', error.message);

    throw new Error(
      "Échec de l'envoi de l'email. Veuillez réessayer."
    );
  }
}

/**
 * Code OTP pour la connexion.
 */
async function sendLoginOtp(to, code) {
  return dispatch({
    to,

    subject: 'Votre code de connexion',

    text:
      `Votre code de connexion est : ${code}`,

    html: otpEmailTemplate({
      code,
      title: 'Code de connexion',

      intro:
        'Voici votre code de vérification à usage unique pour finaliser votre connexion.',

      appName: 'Gestion Vente',
    }),
  });
}

/**
 * Code OTP pour valider une inscription.
 */
async function sendRegistrationOtp(to, code) {
  return dispatch({
    to,

    subject: 'Confirmez votre inscription',

    text:
      `Votre code de confirmation d'inscription est : ${code}`,

    html: otpEmailTemplate({
      code,
      title: 'Confirmez votre inscription',

      intro:
        "Merci de vous être inscrit sur Gestion Vente. Saisissez ce code pour valider votre adresse email et poursuivre la création de votre mot de passe.",

      appName: 'Gestion Vente',
    }),
  });
}

/**
 * Code OTP pour réinitialisation du mot de passe.
 */
async function sendPasswordResetOtp(to, code) {
  return dispatch({
    to,

    subject: 'Réinitialisation de votre mot de passe',

    text:
      `Votre code de réinitialisation de mot de passe est : ${code}`,

    html: otpEmailTemplate({
      code,
      title: 'Réinitialisation du mot de passe',

      intro:
        'Vous avez demandé à réinitialiser votre mot de passe. Saisissez ce code pour continuer.',

      appName: 'Gestion Vente',
    }),
  });
}

/**
 * Code OTP pour changement de mot de passe.
 */
async function sendChangePasswordOtp(to, code) {
  return dispatch({
    to,

    subject:
      'Confirmez le changement de votre mot de passe',

    text:
      `Votre code de confirmation est : ${code}`,

    html: otpEmailTemplate({
      code,
      title: 'Changement de mot de passe',

      intro:
        'Une demande de changement de mot de passe a été effectuée sur votre compte. Saisissez ce code pour la confirmer.',

      appName: 'Gestion Vente',
    }),
  });
}

/**
 * Notification après changement de mot de passe.
 */
async function sendPasswordChangedNotice(to) {
  return dispatch({
    to,

    subject:
      'Votre mot de passe a été modifié',

    text:
      "Votre mot de passe vient d'être modifié avec succès. Si vous n'êtes pas à l'origine de cette action, contactez immédiatement le support et changez votre mot de passe.",

    html: `
      <div style="
        font-family:Arial,sans-serif;
        max-width:480px;
        margin:0 auto;
        padding:24px;
      ">

        <h3>
          Mot de passe modifié
        </h3>

        <p style="color:#4b5563;">
          Votre mot de passe vient d'être modifié avec succès.
        </p>

        <p style="
          color:#b91c1c;
          font-size:13px;
        ">
          Si vous n'êtes pas à l'origine de cette action,
          contactez immédiatement le support et changez votre mot de passe.
        </p>

      </div>
    `,
  });
}

/**
 * Indique si SMTP est configuré.
 */
function isConfigured() {
  getTransporter();
  return smtpConfigured;
}

/**
 * Indique si SMTP a été vérifié.
 */
function isVerified() {
  return smtpVerified;
}

/**
 * Exports
 */
module.exports = {
  sendLoginOtp,
  sendRegistrationOtp,
  sendPasswordResetOtp,
  sendChangePasswordOtp,
  sendPasswordChangedNotice,

  isConfigured,
  isVerified,
  verifySmtp,
};
