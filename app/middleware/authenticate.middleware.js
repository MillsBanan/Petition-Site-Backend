const db = require('../../config/db');

exports.loginRequired = async function (req, res, next) {

    const token = req.headers['x-authorization'];

    try {
        const [result] = await findUserByToken((token));
        console.log(result);
        if (result === undefined) {
            res.status(401)
                .send("Unauthorized")
        } else {
            req.authenticatedUserId = result.user_id.toString();
            next();
        }
    } catch(err) {
        res.status(500)
            .send(`ERROR authenticating user: ${err}`);
    }
};

async function findUserByToken(authToken) {
    const conn = await db.getPool().getConnection();

    const [result] = await conn.query(`SELECT user_id FROM User WHERE auth_token = '${authToken}'`);
    conn.release();
    return result;
}