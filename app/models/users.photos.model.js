const db = require('../../config/db');

exports.viewPhoto = async function(userId) {
    console.log("Retrieving user photo from database...");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT photo_filename from User WHERE user_id = ?', [userId]);
    conn.release();
    if (result.length === 0) {
        return null;
    } else {
        return result[0]["photo_filename"];
    }
};

exports.updatePhoto = async function (userId, filename) {
    console.log("Updating user photo filename in database...");
    const conn = await db.getPool().getConnection();
    const [alreadyHad] = await conn.query('SELECT photo_filename FROM User WHERE user_id = ?', [userId]);
    console.log(alreadyHad);
    const [result] = await conn.query('UPDATE User SET photo_filename = ? WHERE user_id = ?', [filename, userId]);
    conn.release();
    if (result.affectedRows === 0) {
        return 404;
    } else if (alreadyHad[0]["photo_filename"] !== null) {
        return 200;
    } else if (alreadyHad[0]["photo_filename"] === null) {
        return 201;
    } else {
        return 404;
    }
};

exports.userExists = async function (userId) {
    console.log("Checking if user exists...");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT name FROM User WHERE user_id = ?', [userId]);
    return result.length === 1;
}