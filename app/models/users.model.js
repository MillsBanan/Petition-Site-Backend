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
    conn.release();
    return result.insertId;
};

exports.login = async function(userData) {

    console.log("Request to login to the database");

    const conn = await db.getPool().getConnection();
    let auth_token = Date.now().toString();
    auth_token = (await bc.hash(auth_token, 1)).slice(0,32);

    const [result] = await conn.query(`SELECT user_id, password FROM User where email = ${conn.escape(userData.email)}`);
    if (result.length === 0) {
        conn.release();
        return "Invalid E";
    }
    if (await bc.compare(userData.password, result[0].password)) {
        await conn.query(`UPDATE User SET auth_token = '${auth_token}' WHERE email = ${conn.escape(userData.email)}`);
        conn.release();
        return {"userId": result[0].user_id, "token" : auth_token};
    } else {
        conn.release();
        return "Invalid P";
    }
};

exports.getUser = async function (userId) {

    console.log("Request to retrieve user info..");

    const conn = await db.getPool().getConnection();
    const id = conn.escape(userId);
    const [result] = await conn.query(`SELECT name, city, country, email FROM User where user_id = ${id}`);
    conn.release();
    return result[0];
};

exports.updateUser = async function (userData, userId) {
    console.log("Request to update user...");

    const conn = await db.getPool().getConnection();
    if (userData.password !== undefined) {
        const [storedHash] = await conn.query(`SELECT password FROM User where user_id = ?`, [userId]);
        if (storedHash.length === 0) {
            return "Invalid ID";
        } else if (await bc.compare(userData.currentPassword, storedHash[0].password)) {
            userData.password = await bc.hash(userData.password, 10);
        } else {
            return "Invalid password";
        }
    }
    delete userData.currentPassword;
    let sql = "UPDATE User SET ? WHERE user_id = ?";
    await conn.query(sql, [userData, userId]);
    conn.release();
    return "Ok";

};
