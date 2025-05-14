import { google, sheets_v4 } from 'googleapis';
import path from 'path';
import { JWT } from 'google-auth-library';

export async function appendToSheet(dataText: string): Promise<void> {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'credentials.json'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const authClient: JWT = await auth.getClient() as JWT;
  const sheets: sheets_v4.Sheets = google.sheets({ version: 'v4', auth: authClient });

  const spreadsheetId = process.env.SPREADSHEET_ID;
  const range = 'Arkusz1!A:A';

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[dataText]],
    },
  });

  console.log('Dodano do arkusza:', dataText);
}