const db = require('../../config/db');


exports.petitionExists = async function (petitionId) {
    console.log("Checking if petition exists...");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT title FROM Petition WHERE petition_id = ?', [petitionId]);
    conn.release();
    return result.length === 1;
};

exports.viewPhoto = async function(petitionId) {
    console.log("Retrieving petition photo from database...");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT photo_filename from Petition WHERE petition_id = ?', [petitionId]);
    if (result.length === 0) {
        return null;
    } else {
        return result[0]["photo_filename"];
    }
};

exports.userIsAuthor = async function (userId, petitionId) {
    console.log("Checking if user is author of petition");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT author_id FROM Petition WHERE petition_id = ?', [petitionId]);
    conn.release();
    return result[0]["author_id"] === parseInt(userId);
};

exports.updatePhoto = async function (petitionId, filename) {
    console.log("Updating petition photo filename in database...");
    const conn = await db.getPool().getConnection();
    const [alreadyHad] = await conn.query('SELECT photo_filename FROM Petition WHERE petition_id = ?', [petitionId]);
    console.log(alreadyHad);
    const [result] = await conn.query('UPDATE Petition SET photo_filename = ? WHERE petition_id = ?', [filename, petitionId]);
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