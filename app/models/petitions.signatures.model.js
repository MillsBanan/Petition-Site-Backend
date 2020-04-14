const db = require('../../config/db');

exports.petitionNotExists = async function (petitionId) {
    console.log("Checking if petition exists...");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT title FROM Petition WHERE petition_id = ?', [petitionId]);
    conn.release();
    return result.length === 0;
};

exports.petitionClosed = async function (petitionId) {
    console.log("Checking if petition has closed...");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT closing_date FROM Petition WHERE petition_id = ?', [petitionId]);
    conn.release();
    return result[0]["closing_date"] < Date.now();
};

exports.alreadySigned = async function (userId, petitionId) {
    console.log(`Checking if user: ${userId} has already signed petition: ${petitionId}`);
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT signatory_id ' +
                                      'FROM Signature ' +
                                      'WHERE signatory_id = ? AND petition_id = ?', [userId, petitionId]);
    conn.release();
    return result.length > 0;
};

exports.getSignatures = async function (petitionId) {
    console.log(`Retrieving all signatures of petition: ${petitionId}`);

    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT ' +
                                    's.signatory_id as signatoryId, u.name, u.city, u.country, s.signed_date as signedDate ' +
                                    'FROM Signature s ' +
                                        'LEFT JOIN User u ' +
                                            'ON s.signatory_id = u.user_id ' +
                                    'WHERE s.petition_id = ? ' +
                                    'ORDER BY s.signed_date ASC', [petitionId]);
    console.log(result);
    conn.release();
    return result;
};

exports.signPetition = async function (userId, petitionId) {
    console.log("Signing petition...");
    const dateSigned = new Date().toISOString().slice(0, 10) + ' 00:00:00';
    const inserts = [userId, petitionId, dateSigned];
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('INSERT INTO Signature (signatory_id, petition_id, signed_date) ' +
                                      'VALUES (?)', [inserts]);
    console.log(result);
    conn.release();
    return result;
};

exports.userIsAuthor = async function (userId, petitionId) {
    console.log("Checking if user is author of petition");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('SELECT author_id FROM Petition WHERE petition_id = ?', [petitionId]);
    conn.release();
    return result[0]["author_id"] === parseInt(userId);
};

exports.deleteSignature = async function (userId, petitionId) {
    console.log("Deleting signature from petition...");
    const conn = await db.getPool().getConnection();
    const [result] = await conn.query('DELETE FROM Signature WHERE signatory_id = ? and petition_id = ?', [userId, petitionId]);
    conn.release();
    return result;
};
