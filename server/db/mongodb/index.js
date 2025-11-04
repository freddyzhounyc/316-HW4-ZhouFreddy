const DatabaseManager = require('../index');
const mongoose = require('mongoose');
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const dotenv = require('dotenv');
dotenv.config({
    path: __dirname + "/../../.env"
});

const playlistSchema = new Schema(
    {
        name: { type: String, required: true },
        ownerEmail: { type: String, required: true },
        songs: { type: [{
            title: String,
            artist: String,
            year: Number,
            youTubeId: String
        }], required: true }
    },
    { timestamps: true },
)
const UserSchema = new Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        passwordHash: { type: String, required: true },
        playlists: [{type: ObjectId, ref: 'Playlist'}]
    },
    { timestamps: true },
)

/**
 * Mongo implementation of the DatabaseManager
 */
class MongoDBManager extends DatabaseManager {

    connect() {
        try {
            mongoose.connect(process.env.MONGO_DB_CONNECT, { useNewUrlParser: true });
            return null;
        } catch (err) {
            console.error("Connection Error", err.message);
        }
    }
    async save(collection, saveObject) {
        let newSave = new collection(saveObject);
        return await newSave.save();
    }
    async readOneById(collection, id) {
        return await collection.findOne({ _id: id })
    }
    async readOne(collection, criteria) {
        return await collection.findOne(criteria);
    }
    async readAll(collection, criteria) {
        return await collection.find(criteria);
    }
    async deleteById(collection, id) {
        return await collection.findOneAndDelete({ _id: id });
    }
    async delete(collection, criteria) {
        return await collection.findOneAndDelete(criteria);
    }

}
module.exports = {
    MongoDBManager,
    MongoPlaylist: mongoose.model('Playlist', playlistSchema),
    MongoUser: mongoose.model('User', UserSchema)
};