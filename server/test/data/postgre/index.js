const dotenv = require('dotenv');
dotenv.config({
    path: __dirname + "/../../../.env"
});
const { resetPostgres } = require("../../../db/postgresql/index");
const { PostgreSQLManager } = require("../../../db/postgresql/index");

let runProgram = async () => {
    try {
        let postgresManager = new PostgreSQLManager();
        postgresManager.connect();
        await resetPostgres();
    } catch (err) {
        console.error("Connection error", err.message);
    }
}
runProgram()
    .then(() => {
        console.log("Postgres reset completed!");
    })
    .catch((err) => {
        console.error("Postgres reset failed!", err);
    })