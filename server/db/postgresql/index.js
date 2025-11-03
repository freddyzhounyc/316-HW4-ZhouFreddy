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
    async save(collection, saveObject) {
        let row = collection.build(saveObject);
        return await row.save();
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
    async readAll(collection) {
        return await collection.findAll();
    }
    async delete(collection, criteria) {
        let toDelete = await collection.findOne({
            where: criteria
        });
        return await toDelete.destroy();
    }

}
module.exports = {
    PostgreSQLManager,
    PostgresPlaylist: Playlist,
    PostgresUser: User
};