const dotenv = require('dotenv').config({ path: __dirname + '/../../../.env' });
const { resetMongo } = require('../../../db/mongodb/index');
const { MongoDBManager } = require('../../../db/mongodb/index');

let runProgram = async () => {
    try {
        let mongoManager = new MongoDBManager();
        mongoManager.connect();
        await resetMongo();
    } catch (err) {
        console.error("Connection error", err.message);
    }
}
runProgram()
    .then(() => {
        console.log("MongoDB reset completed");
    })
    .catch((err) => {
        console.error("MongoDB reset failed:", err);
    });