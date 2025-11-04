import { beforeAll, beforeEach, afterEach, afterAll, expect, test } from 'vitest';
const dotenv = require('dotenv')
dotenv.config({ 
    path: __dirname + '/../.env' 
});
const { MongoDBManager, MongoPlaylist, MongoUser, resetMongo } = require('../db/mongodb/index');
const { PostgreSQLManager, PostgresPlaylist, PostgresUser, resetPostgres } = require('../db/postgresql/index');

/**
 * Vitest test script for the Playlister app's Database Manager. Testing should verify that the Database Manager 
 * will perform all necessarily operations properly.
 *  
 * Scenarios we will test:
 *  1) Reading a User from the database
 *  2) Creating a User in the database
 *  3) ...
 * 
 * You should add at least one test for each database interaction. In the real world of course we would do many varied
 * tests for each interaction.
 */

/**
 * Executed once before all tests are performed.
 */

let dbManager = null;
let user = null;
let playlist = null;

beforeAll(async () => {
    if (process.env.DB_CHOICE.toLowerCase() === "mongodb") {
        dbManager = new MongoDBManager();
        user = MongoUser;
        playlist = MongoPlaylist;
    } else if (process.env.DB_CHOICE.toLowerCase() === "postgres") {
        dbManager = new PostgreSQLManager();
        user = PostgresUser;
        playlist = PostgresPlaylist;
    } else
        throw new Error("Invalid .env value for DB_CHOICE!");

    try {
        dbManager.connect();
    } catch (err) {
        console.error("Connection Error", err.message);
    }
});

/**
 * Executed before each test is performed.
 */
beforeEach(async () => {
    try {
        // reset db to default values in json file
        if (process.env.DB_CHOICE.toLowerCase() === "mongodb")
            await resetMongo();
        else // else can be used as other choices besides mongodb or postgres has been taken care of
            await resetPostgres();
    } catch (err) {
        console.error("Failed to reset datbase!", err.message);
    }
});

/**
 * Executed after each test is performed.
 */
afterEach(() => {
});

/**
 * Executed once after all tests are performed.
 */
afterAll(async () => {
    try {
        // reset db to default values in json file
        if (process.env.DB_CHOICE.toLowerCase() === "mongodb")
            await resetMongo();
        else // else can be used as other choices besides mongodb or postgres has been taken care of
            await resetPostgres();
    } catch (err) {
        console.error("Failed to reset datbase!", err.message);
    }
});

/**
 * Vitest test to see if the Database Manager can get a User.
 */
test('Test #1) Reading a User from the Database With Criteria', async () => {
    const expectedUser = {
        firstName: "Joe",
        lastName: "Shmo",
        email: "joe@shmo.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu",
        playlists: [
            "68f524b611e0f3901871f164",
            "68f526c1ec1ea2ad00a6fae0"
        ]
    };

    // THIS WILL STORE THE DATA RETRUNED BY A READ USER
    let actualUser = {};

    // READ THE USER
    actualUser = await dbManager.readOne(user, { email: expectedUser.email }); // Function to TEST!

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(actualUser.firstName).toBe(expectedUser.firstName);
    expect(actualUser.lastName).toBe(expectedUser.lastName);
    // AND SO ON
});

/**
 * Vitest test to see if the Database Manager can create a User
 */
test('Test #2) Creating a User in the Database', async () => {
    // MAKE A TEST USER TO CREATE IN THE DATABASE
    let testUser = {
        firstName: "Chris",
        lastName: "Brown",
        email: "cbrown@gmail.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu",
        playlists: []
    }

    // CREATE THE USER
    await dbManager.save(user, testUser); // Function to TEST!

    // NEXT TEST TO SEE IF IT WAS PROPERLY CREATED

    // FILL IN A USER WITH THE DATA YOU EXPECT THEM TO HAVE
    const expectedUser = {
        firstName: "Chris",
        lastName: "Brown",
        email: "cbrown@gmail.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu",
        playlists: []
    };

    // THIS WILL STORE THE DATA RETRUNED BY A READ USER
    let actualUser = {};

    // READ THE USER
    actualUser = await dbManager.readOne(user, { email: testUser.email });

    // COMPARE THE VALUES OF THE EXPECTED USER TO THE ACTUAL ONE
    expect(actualUser.firstName).toBe(expectedUser.firstName);
    expect(actualUser.lastName).toBe(expectedUser.lastName);
    // AND SO ON
});

// THE REST OF YOUR TEST SHOULD BE PUT BELOW
test("Test #3) Reading a User by ID in the Database", async () => {
    const testUser = {
        firstName: "Steph",
        lastName: "Curry",
        email: "chefcurry@gmail.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu",
        playlists: []
    };

    const savedUser = await dbManager.save(user, testUser);

    const expectedUser = {
        firstName: "Steph",
        lastName: "Curry",
        email: "chefcurry@gmail.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu",
        playlists: []
    }

    const actualUser = await dbManager.readOneById(user, savedUser._id || savedUser.id); // Function to TEST!

    expect(actualUser.firstName).toBe(expectedUser.firstName);
    expect(actualUser.lastName).toBe(expectedUser.lastName);
    expect(actualUser.email).toBe(expectedUser.email);
});

test("Test #4) Reading All Playlists With A Certain Criteria", async () => {
    const testUser = {
        firstName: "Seth",
        lastName: "Curry",
        email: "chefcurry@gmail.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu",
        playlists: [] // disregarded for sequelize
    }
    const testPlaylist1 = {
        name: "MyPlaylist",
        ownerEmail: "chefcurry@gmail.com",
        songs: []
    };
    const testPlaylist2 = {
        name: "MySecondPlaylist",
        ownerEmail: "chefcurry@gmail.com",
        songs: []
    };

    await dbManager.save(user, testUser);
    await dbManager.save(playlist, testPlaylist1);
    await dbManager.save(playlist, testPlaylist2);

    const resultArray = await dbManager.readAll(playlist, { ownerEmail: testUser.email }); // Function to TEST!
    expect(resultArray).toHaveLength(2);
});

test("Test #5) Update a Playlist in the Database", async () => {
    const newPlaylist = {
        ownerEmail: "joe@shmo.com",
        name: "Three",
        songs: []
    }

    const createdPlaylist = await dbManager.save(playlist, newPlaylist);

    let updatePlaylist = {
        ownerEmail: "joe@shmo.com",
        name: "Twenty One",
        songs: []
    };
    if (process.env.DB_CHOICE.toLowerCase() === "postgres") {
        updatePlaylist = {
            ...updatePlaylist,
            id: createdPlaylist.id || createdPlaylist._id
        }
    } else if (process.env.DB_CHOICE.toLowerCase() === "mongodb") {
        updatePlaylist = {
            ...updatePlaylist,
            _id: createdPlaylist.id || createdPlaylist._id
        }
    }

    const savedPlaylist = await dbManager.save(playlist, updatePlaylist); // Function to TEST!

    let expectedPlaylist = {
        ownerEmail: "joe@shmo.com",
        name: "Twenty One",
        songs: []
    }
    if (process.env.DB_CHOICE.toLowerCase() === "postgres") {
        expectedPlaylist = {
            ...expectedPlaylist,
            id: createdPlaylist.id || createdPlaylist._id
        }
    } else if (process.env.DB_CHOICE.toLowerCase() === "mongodb") {
        expectedPlaylist = {
            ...expectedPlaylist,
            _id: createdPlaylist.id || createdPlaylist._id
        }
    }

    const actualPlaylist = await dbManager.readOneById(playlist, (savedPlaylist._id || savedPlaylist.id));
    
    expect(actualPlaylist.name).toBe(expectedPlaylist.name);
    expect(actualPlaylist.songs).toHaveLength(expectedPlaylist.songs.length);
});

test("Test #6) Test if Connection is Established", async () => {
    const actualValue = await dbManager.connect(); // Function to TEST!
    expect(actualValue).toBeNull();
})

test("Test #7) Test Deleting a User By ID", async () => {
    const testUser = {
        firstName: "Steph",
        lastName: "Curry",
        email: "chefcurry@gmail.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu",
        playlists: [] // disregarded for sequelize
    }
    const savedUser = await dbManager.save(user, testUser);
    const readSavedUser = await dbManager.readOneById(user, savedUser.id || savedUser._id);
    expect(savedUser.email).toBe(readSavedUser.email);

    await dbManager.deleteById(user, savedUser.id || savedUser._id); // Function to TEST!
    const readDeletedUser = await dbManager.readOneById(user, savedUser.id || savedUser._id);
    expect(readDeletedUser).toBeNull();
});

test("Test #8) Test Deleting a User By Criteria", async () => {
    const testUser = {
        firstName: "Steph",
        lastName: "Curry",
        email: "chefcurry@gmail.com",
        passwordHash: "$2a$10$dPEwsAVi1ojv2RfxxTpZjuKSAbep7zEKb5myegm.ATbQ4sJk4agGu",
        playlists: [] // disregarded for sequelize
    }
    const savedUser = await dbManager.save(user, testUser);
    const readSavedUser = await dbManager.readOneById(user, savedUser.id || savedUser._id);
    expect(savedUser.email).toBe(readSavedUser.email);

    await dbManager.delete(user, { email: "chefcurry@gmail.com" });
    const readDeletedUser = await dbManager.readOneById(user, savedUser.id || savedUser._id);
    expect(readDeletedUser).toBeNull();
});