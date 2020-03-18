const db = require('../../config/db');
const bc = require('bcrypt');

exports.insert = async function(userData) {

    console.log('Request to insert a user into the database...');
    const conn = await db.getPool().getConnection();

    let insert_columns = 'name, email, password';
    let insert_values = `${conn.escape(userData.name)}, ${conn.escape(userData.email)}, '${await bc.hash(userData.password, 10)}'`;
    if (userData.city !== undefined) {
        insert_columns += ', city';
        insert_values += `, ${conn.escape(userData.city)}`;
    }
    if (userData.country !== undefined) {
        insert_columns += ', country';
        insert_values += `, ${conn.escape(userData.country)}`;
    }

    const [result] = await conn.query(`INSERT INTO User (${insert_columns}) VALUES (${insert_values})`);
    return result.insertId;
};

exports.checkEmailInUse = async function(email) {

    console.log('Request to check if an email is in use!');

    const conn = await db.getPool().getConnection();

    const [result] = await conn.query(`SELECT * FROM User where email = ${email}`);
    if (result.affectedRows !== 0) {
        throw "Email in use!";
    }
};