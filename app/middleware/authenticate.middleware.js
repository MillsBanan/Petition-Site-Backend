const db = require('../../config/db');

exports.loginRequired = async function (req, res, next) {

    const token = req.headers['x-authorization'];

    try {
        const result = await findUserByToken((token));
        if (result === null) {
            res.status(401)
                .send("Unauthorized")
        } else {
            req.authenticatedUserId = result[0].user_id.toString();
            next();
        }
    } catch(err) {
        res.status(500)
            .send(`ERROR authenticating user`);
    }
};

async function findUserByToken(authToken) {
    const conn = await db.getPool().getConnection();

    const [result] = await conn.query(`SELECT user_id FROM User WHERE auth_token = '${authToken}'`);
    return result;
}