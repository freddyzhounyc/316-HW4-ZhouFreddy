const dotenv = require('dotenv');
dotenv.config({
    path: __dirname + "/../../../.env"
});

async function clearCollection(collection, collectionName) {
    try {
        await collection.destroy({
            where: {}
        });
        console.log(collectionName + " cleared");
    } catch (err) {
        console.log(err);
    }
}

async function fillCollection(collection, collectionName, data) {
    for (let i = 0; i < data.length; i++) {
        let doc = collection.build(data[i]);
        await doc.save();
    }
    console.log(collectionName + " filled");
}

async function resetPostgres() {
    const Playlist = require("../../../models/postgres/playlist-model");
    const User = require("../../../models/postgres/user-model");
    const testData = require("../example-db-data.json");

    console.log("Resetting the Postgres DB");

    await User.sync();
    await Playlist.sync();

    await clearCollection(Playlist, "Playlist");
    await clearCollection(User, "User");
    await fillCollection(User, "User", testData.users);
    await fillCollection(Playlist, "Playlist", testData.playlists);
}

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.POSTGRES_DB_CONNECT);
const runProgram = async () => {
    try {
        await resetPostgres();
    } catch (err) {
        console.error("Connection error", err.message);
    }
}
runProgram();