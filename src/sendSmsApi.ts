import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.SMSAPI_TOKEN;
const from = process.env.SMSAPI_FROM;
const recipients = process.env.SMSAPI_TO ? process.env.SMSAPI_TO.split(',').map(n => n.trim()): [];
const message = process.argv.slice(2).join(' ') || 'Wiadomosc testowa z SMSAPI';



if (!token) {
  console.error('❌ Brakuje SMSAPI_TOKEN w pliku .env');
  process.exit(1);
}

if (!recipients || recipients.length === 0) {
  console.error('❌ Brak numerów telefonów w SMSAPI_TO');
  process.exit(1);
}

export async function sendSmsApi(message: string): Promise<void> {
  for (const to of recipients) {
    try {
      const params = new URLSearchParams({
        to,
        message,
        from: from || 'SMSAPI',
        format: 'json',
      });

      const response = await axios.post('https://api.smsapi.pl/sms.do', params, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      console.log(
        `✅ SMS do ${to} wysłany. ID wiadomości: ${response.data.message_id}, Status: ${response.status} ${response.statusText}`
      );
    } catch (err: any) {
      console.error(`❌ Błąd przy wysyłaniu SMS do ${to}:`, err.response?.data || err.message);
    }
  }
}