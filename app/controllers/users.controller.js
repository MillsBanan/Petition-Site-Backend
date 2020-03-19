const users = require('../models/users.model');

exports.create = async function(req, res) {

    console.log("\nRequest to add a user to the database");

    const userData = {
        "name": req.body.name,
        "email": req.body.email,
        "password": req.body.email,
        "city": req.body.city,
        "country": req.body.country
    };

    try {
        checkEmailValid(userData.email);
        await users.checkEmailInUse(userData.email);
    } catch {
        res.status(400)
            .send("Email address was invalid or in use!");
    }

    try {
        let result = await users.insert(userData);
        result = {
            "userId" : result
        }
        res.status(201)
            .send(result);
    } catch(err) {
        res.status(500)
            .send(`ERROR creating user: ${err}`);
    }
};

function checkEmailValid(email) {
    const re = /@/;
    if (!(re.test(email))) {
        throw "Email address invalid!";
    }
}