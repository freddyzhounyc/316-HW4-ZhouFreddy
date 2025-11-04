const DatabaseManager = require('../index');
const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config({
    path: __dirname + "/../../.env"
});

const sequelize = new Sequelize(process.env.POSTGRES_DB_CONNECT);

const User = sequelize.define("user", {
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        },
        unique: true
    },
    passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    }
}, {
    timestamps: true
});

const Playlist = sequelize.define('playlist', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    ownerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true
        },
        references: {
            model: "users",
            key: "email"
        }
    },
    songs: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: false,
        defaultValue: [],
    }
}, {
    timestamps: true
});

User.hasMany(Playlist, {
    foreignKey: "ownerEmail",
    as: "playlists",
    onDelete: "CASCADE"
});

Playlist.belongsTo(User, {
    foreignKey: "ownerEmail",
    as: "owner"
});

class PostgreSQLManager extends DatabaseManager {

    connect() {
        const sequelize = new Sequelize(process.env.POSTGRES_DB_CONNECT);
        return null;
    }
    // async save(collection, saveObject) {
    //     console.log("YEAHHERE" + saveObject.name); // Good
    //     if (saveObject.id) {
    //         let oldObject = await collection.findOne({
    //             where: {
    //                 id: saveObject.id
    //             }
    //         });
    //         oldObject.set(saveObject);
    //         console.log("YEPHERE" + oldObject.name);
    //         let newObject = await oldObject.save();
    //         console.log("YEPHERE" + newObject.name);
    //         return newObject;
    //     } else {
    //         let row = collection.build(saveObject);
    //         return await row.save();
    //     }
    // }
    async save(collection, saveObject) {
        if (saveObject.id) {
            // update directly in DB
            const [rowsUpdated, [updatedObject]] = await collection.update(
                saveObject,
                {
                    where: { id: saveObject.id },
                    returning: true // returns updated row(s)
                }
            );
            console.log("YEPHERE" + updatedObject.name);
            return updatedObject;
        } else {
            return await collection.create(saveObject, { returning: true });
        }
    }

    async readOneById(collection, id) {
        return await collection.findOne({
            where: {
                id: id
            }
        });
    }
    async readOne(collection, criteria) {
        return await collection.findOne({
            where: criteria
        });
    }
    async readAll(collection, criteria) {
        return await collection.findAll({
            where: criteria
        });
    }
    async deleteById(collection, id) {
        let toDelete = await collection.findOne({
            where: {
                id: id
            }
        });
        return await toDelete.destroy();
    }
    async delete(collection, criteria) {
        let toDelete = await collection.findOne({
            where: criteria
        });
        return await toDelete.destroy();
    }

}

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
    const PostgresPlaylist = Playlist;
    const PostgresUser = User;
    const testData = require("../../test/data/example-db-data.json");

    console.log("Resetting the Postgres DB");

    await PostgresUser.sync();
    await PostgresPlaylist.sync();

    await clearCollection(PostgresPlaylist, "Playlist");
    await clearCollection(PostgresUser, "User");
    await fillCollection(PostgresUser, "User", testData.users);
    await fillCollection(PostgresPlaylist, "Playlist", testData.playlists);
}

module.exports = {
    PostgreSQLManager,
    PostgresPlaylist: Playlist,
    PostgresUser: User,
    clearCollection,
    fillCollection,
    resetPostgres
};