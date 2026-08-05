import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "whale_watching";

let db = null;

export async function getDb() {
  if (db) return db;
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  // unique booking reference
  await db.collection("bookings").createIndex({ ref: 1 }, { unique: true }).catch(() => {});
  console.log(`[db] connected to ${uri}/${dbName}`);
  return db;
}
