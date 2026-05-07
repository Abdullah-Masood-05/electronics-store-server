// test-connection.js
import { MongoClient } from "mongodb";

const uri = "mongodb+srv://bscs22054_db_user:AHCsCt3nFtOjlmsD@electrostore.ko0ny0q.mongodb.net/?appName=ElectroStore";

async function testConnection() {
    console.log("Attempting to connect...");
    try {
        const client = await MongoClient.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
        console.log("✅ Successfully connected!");
        await client.close();
    } catch (error) {
        console.error("❌ Connection failed:", error.message);
        console.error("Full error:", error);
    }
}

testConnection();