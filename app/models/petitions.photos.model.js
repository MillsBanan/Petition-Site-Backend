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

exports.petitionHasPhoto = async function (petitionId) {
    console.log("Checking if petition has a hero photo...");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('')
};