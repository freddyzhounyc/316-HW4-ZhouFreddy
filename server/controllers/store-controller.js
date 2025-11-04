// const { MongoPlaylist } = require('../db/mongodb/index');
// const Playlist = MongoPlaylist;
// const { MongoUser } = require('../db/mongodb/index');
// const User = MongoUser;
const { MongoDBManager } = require("../db/mongodb/index");
const { PostgreSQLManager } = require("../db/postgresql/index");
const auth = require('../auth')
const dotenv = require('dotenv');
dotenv.config({
    path: __dirname + "/../.env"
});

class StoreController {

    /**
     * Dependency Injection
     */
    constructor(databaseManager, user, playlist) {
        this.databaseManager = databaseManager;
        this.user = user;
        this.playlist = playlist;
    }

    createPlaylist = async (req, res) => {
        if (auth.verifyUser(req) === null) {
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            })
        }
        const body = req.body;
        console.log("createPlaylist body: " + JSON.stringify(body));
        if (!body) {
            return res.status(400).json({
                success: false,
                error: 'You must provide a Playlist',
            })
        }
        
        let playlist = null;
        try {
            playlist = await this.databaseManager.save(this.playlist, body);
            console.log("playlist: " + playlist.toString());
        } catch (err) {
            await this.databaseManager.delete(this.playlist, playlist);
            return res.status(400).json({ success: false, error: err });
        }

        try {
            let user = await this.databaseManager.readOneById(this.user, req.userId);
            console.log("user found: " + JSON.stringify(user));
            if (playlist._id)
                user.playlists.push(playlist._id);

            await this.databaseManager.save(this.user, user);
        } catch (err) {
            console.error("Error", err.message);
        }

        try {
            return res.status(201).json({playlist: playlist});
        } catch (err) {
            return res.status(400).json({ errorMessage: 'Playlist Not Created!' });
        }
    }

    deletePlaylist = async (req, res) => {
        if (auth.verifyUser(req) === null) {
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            })
        }
        console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
        console.log("delete " + req.params.id);

        let playlist = null;
        try {
            playlist = await this.databaseManager.readOneById(this.playlist, req.params.id);
            console.log("playlist found: " + JSON.stringify(playlist));
        } catch (err) {
            return res.status(404).json({ errorMessage: 'Playlist not found!' })
        }

        // DOES THIS LIST BELONG TO THIS USER?
        try {
            let user = await this.databaseManager.readOne(this.user, { email: playlist.ownerEmail });
            console.log("user._id: " + user._id || user.id);
            console.log("req.userId: " + req.userId);
            if ((user._id || user.id) == req.userId) {
                console.log("correct user!");

                try {
                    await this.databaseManager.deleteById(this.playlist, req.params.id);
                    return res.status(200).json({});
                } catch (err) {
                    console.log(err)
                }
            } else {
                console.log("incorrect user!");
                return res.status(400).json({ 
                    errorMessage: "authentication error" 
                });
            }
        } catch (err) {
            console.log(err);
        }
    }

    getPlaylistById = async (req, res) => {
        if(auth.verifyUser(req) === null){
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            })
        }
        console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

        try {
            let list = await this.databaseManager.readOneById(this.playlist, req.params.id);
            console.log("Found list: " + JSON.stringify(list));

            // DOES THIS LIST BELONG TO THIS USER?
            try {
                let user = await this.databaseManager.readOne(this.user, { email: list.ownerEmail });
                console.log("user._id: " + user._id || user.id);
                console.log("req.userId: " + req.userId);
                if ((user._id || user.id) == req.userId) {
                    console.log("correct user!");
                    return res.status(200).json({ success: true, playlist: list })
                } else {
                    console.log("incorrect user!");
                    return res.status(400).json({ success: false, description: "authentication error" });
                }
            } catch (err) {
                console.log(err);
            }
        } catch (err) {
            return res.status(400).json({ success: false, error: err });
        }
    }

    getPlaylistPairs = async (req, res) => {
        if(auth.verifyUser(req) === null){
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            })
        }
        console.log("getPlaylistPairs");

        try {
            let user = await this.databaseManager.readOneById(this.user, req.userId);
            console.log("find user with id " + req.userId);
            try {
                let email = user.email;
                console.log("find all Playlists owned by " + email);
                let playlists = await this.databaseManager.readAll(this.playlist, { ownerEmail: email });
                console.log("found Playlists: " + JSON.stringify(playlists));
                if (!playlists) {
                    console.log("!playlists.length");
                    return res
                        .status(404)
                        .json({ success: false, error: 'Playlists not found' })
                } else {
                    console.log("Send the Playlist pairs");
                    // PUT ALL THE LISTS INTO ID, NAME PAIRS
                    let pairs = [];
                    for (let key in playlists) {
                        let list = playlists[key];
                        let pair = {
                            _id: list._id || list.id,
                            name: list.name
                        };
                        pairs.push(pair);
                    }
                    for (let i = 0; i < pairs.length; i++) {
                        console.log("HERERIGHTHERE" + pairs[i].name);
                    }
                    return res.status(200).json({ success: true, idNamePairs: pairs });
                }
            } catch (err) {
                return res.status(400).json({ success: false, error: err })
            }
        } catch (err) {
            console.log(err)
        }
    }

    getPlaylists = async (req, res) => {
        if(auth.verifyUser(req) === null){
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            })
        }

        try {
            let playlists = await this.databaseManager.readAll(this.playlist, {});
            if (!playlists.length) {
                return res
                    .status(404)
                    .json({ success: false, error: `Playlists not found` })
            }
            return res.status(200).json({ success: true, data: playlists });
        } catch (err) {
            return res.status(400).json({ success: false, error: err });
        }
    }

    updatePlaylist = async (req, res) => {
        if(auth.verifyUser(req) === null){
            return res.status(400).json({
                errorMessage: 'UNAUTHORIZED'
            })
        }
        const body = req.body;
        console.log("updatePlaylist: " + JSON.stringify(body));
        console.log("req.body.name: " + req.body.name);

        if (!body) {
            return res.status(400).json({
                success: false,
                error: 'You must provide a body to update',
            })
        }

        try {
            let list = await this.databaseManager.readOneById(this.playlist, req.params.id);
            //console.log("playlist found: " + JSON.stringify(playlist));

            try {
                //let list = playlist;
                let user = await this.databaseManager.readOne(this.user, { email: list.ownerEmail });
                console.log("user._id: " + (user._id || user.id));
                console.log("req.userId: " + req.userId);
                if ((user._id || user.id) == req.userId) {
                    console.log("correct user!");
                    console.log("req.body.name: " + req.body.name);

                    list.name = body.playlist.name;
                    list.songs = body.playlist.songs;

                    try {
                        if (process.env.DB_CHOICE.toLowerCase() === "postgres")
                            await this.databaseManager.save(this.playlist, list.get({ plain: true }));
                        else if (process.env.DB_CHOICE.toLowerCase() === "mongodb") {
                            console.log("WAHH");
                            await this.databaseManager.save(this.playlist, list);
                        }
                        console.log("SUCCESS!!!");
                        return res.status(200).json({
                                    success: true,
                                    id: list._id || list.id,
                                    message: 'Playlist updated!',
                                });
                    } catch (error) {
                        console.log("FAILURE: " + JSON.stringify(error));
                        return res.status(404).json({
                            error,
                            message: 'Playlist not updated!',
                        });
                    }
                } else {
                    console.log("incorrect user!");
                    return res.status(400).json({ success: false, description: "authentication error" });
                }
            } catch (err) {
                console.log(err);
            }
        } catch (err) {
            return res.status(404).json({ err, message: 'Playlist not found!' });
        }
    }

}

const getStoreController = () => {
    if (process.env.DB_CHOICE.toLowerCase() === "mongodb") {
        let mongoManager = new MongoDBManager();
        mongoManager.connect();
        const { MongoUser } = require("../db/mongodb/index");
        const { MongoPlaylist } = require("../db/mongodb/index");
        return new StoreController(mongoManager, MongoUser, MongoPlaylist);
    } else if (process.env.DB_CHOICE.toLowerCase() === "postgres") {
        let postgresManager = new PostgreSQLManager();
        postgresManager.connect();
        const { PostgresUser } = require("../db/postgresql/index");
        const { PostgresPlaylist } = require("../db/postgresql/index");
        return new StoreController(postgresManager, PostgresUser, PostgresPlaylist);
    } else
        throw new Error("Choose a correct option! \"MONGODB\" or \"POSTGRES\"!");
}

module.exports = getStoreController();