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

  const spreadsheetId = process.env.SPREADSHEET_ID!;
  const sheetName = 'Arkusz1';
  const columnRange = `${sheetName}!A:A`;

  // 1. Pobierz istniejące dane
  const existingData = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: columnRange,
  });

  const oldValues = existingData.data.values ?? [];

  // 2. Dodaj nowy wpis na początek
  const updatedValues = [[dataText], ...oldValues];

  // 3. Nadpisz wszystkie dane w kolumnie A
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: columnRange,
    valueInputOption: 'RAW',
    requestBody: {
      values: updatedValues,
    },
  });

  console.log('Nowy wpis w A1:', dataText);
}