const { Sequelize, DataTypes } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config({
    path: __dirname + "/../../.env"
});
const Playlist = require("./playlist-model");

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

User.hasMany(Playlist, {
    foreignKey: "ownerEmail",
    as: "playlists",
    onDelete: "CASCADE"
});

Playlist.belongsTo(User, {
    foreignKey: "ownerEmail",
    as: "owner"
});

module.exports = User;