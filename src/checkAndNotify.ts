import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import path from 'path';
import { Twilio } from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

// Konfiguracja SMS
const accountSid = process.env.TWILIO_SID!;
const authToken = process.env.TWILIO_AUTH!;
const fromNumber = process.env.TWILIO_FROM!;
const recipients = (process.env.SMS_RECIPIENTS ?? '').split(',');

const twilio = new Twilio(accountSid, authToken);

async function sendSMS(message: string) {
  for (const to of recipients) {
    await twilio.messages.create({
      body: message,
      from: fromNumber,
      to: to.trim(),
    });
  }
}

async function checkAndNotify() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const authClient: JWT = await auth.getClient() as JWT;
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const spreadsheetId = process.env.SPREADSHEET_ID!;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Arkusz1!A1:A4',
  });

  const rows = res.data.values ?? [];

  let found = false;
  let message = '';

  for (let i = 0; i < rows.length; i++) {
    const cell = rows[i][0] ?? '';
    const relevantPart = cell.slice(22,45).trim();

    console.log(`A${i + 1}:`, relevantPart);

    if (!relevantPart.startsWith('Brak')) {
      found = true;
      message += `🟢 ${relevantPart}\n`;
    }
  }

  if (found) {
    console.log('Wysyłanie SMS:\n', message);
    await sendSMS(`🩺 Dostępne terminy:\n${message}`);
  } else {
    console.log('Brak dostępnych terminów w A1–A4');
  }
}

checkAndNotify().catch(console.error);