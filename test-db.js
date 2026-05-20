import pkg from 'pg';
const { Client } = pkg;
import 'dotenv/config';

async function test() {
  const url = process.env.DATABASE_URL.replace('.c-2.', '.');
  console.log("Trying URL:", url);
  const client = new Client({
    connectionString: url,
  });
  try {
    await client.connect();
    const result = await client.query('SELECT version()');
    console.log("Connection successful:", result.rows[0].version);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    await client.end();
  }
}
test();
