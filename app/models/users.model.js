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

exports.login = async function(userData) {

    console.log("Request to login to the database");

    const conn = await db.getPool().getConnection();
    let auth_token = Date.now().toString();
    auth_token = (await bc.hash(auth_token, 1)).slice(0,32);

    const [result] = await conn.query(`SELECT user_id, password FROM User where email = ${conn.escape(userData.email)}`);
    if (result.length === 0) {
        return "Invalid E";
    }
    if (await bc.compare(userData.password, result[0].password)) {
        await conn.query(`UPDATE User SET auth_token = '${auth_token}' WHERE email = ${conn.escape(userData.email)}`);
        return {"userId": result[0].user_id, "token" : auth_token};
    } else {
        return "Invalid P";
    }
};