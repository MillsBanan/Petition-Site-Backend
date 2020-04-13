const users = require('../models/users.model');

exports.create = async function(req, res) {

    console.log("\nRequest to add a user to the database");

    const userData = {
        "name": req.body.name,
        "email": req.body.email,
        "password": req.body.password,
        "city": req.body.city,
        "country": req.body.country
    };


    try {
        if (!userData.email.includes('@')) {
            res.status(400)
                .send("ERROR: Email not valid..");
        } else if (userData.name === undefined) {
            res.status(400)
                .send('ERROR: Name field is mandatory');
        } else if (userData.password === undefined) {
            res.status(400)
                .send('ERROR: Password field is mandatory');
        } else {
            let result = {"userId": await users.insert(userData)};
            res.status(201)
                .send(result);
        }
    } catch(err) {
        if (err.code === 'ER_DUP_ENTRY') {
            res.status(400)
                .send('ERROR: Duplicate entry for email');
        } else {
            res.status(500)
                .send(`ERROR creating user: ${err}`);
        }
    }
};

exports.login = async function(req, res) {
    console.log("Request to login to the server");

    const userData = req.body;
    try {
        if (userData.email === undefined || userData.password === undefined) {
            res.status(400)
                .send("Username and password must not be left blank");
        } else {
            const result = await users.login(userData);
            if (result === "Invalid E") {
                res.status(400)
                    .send("ERROR: Invalid email");

            } else if (result === "Invalid P"){
                res.status(400)
                    .send("ERROR: Invalid Password");

            } else {
                res.status(200)
                    .send(result);
            }
        }
    } catch(err) {
        res.status(500)
            .send(`ERROR logging in: ${err}`);
    }
};

exports.logout = async function(req, res) {
    console.log("Request to logout of the server");

    const userId = req.authenticatedUserId;

    try {
        if (userId === undefined) {
            res.status(401)
                .send();
        } else {
            res.status(200)
                .send();
        }
    } catch (err) {
        res.status(500)
            .send();
    }

};

exports.viewUser = async function (req, res) {
    console.log("Request to view user...");
    const authUserId = req.authenticatedUserId;
    const ownId = authUserId === req.params.id;
    try {
        if (req.params.id === undefined) {
            res.statusMessage = 'User ID cannot be blank';
            res.status(404)
                .send();
        } else {
            const result = await users.getUser(req.params.id);
            console.log(result);
            if (result === undefined) {
                res.statusMessage = "Oops";
                res.status(404)
                    .send();
            }
            if (!ownId) {
                delete result.email;
            }
            if (result.city === undefined) {
                delete result.city;
            }
            if (result.country === undefined) {
                delete result.country;
            }
            res.status(200)
                .send(result);
        }
    } catch(err) {
        res.status(500)
            .send();
    }
};

exports.patchUser = async function (req, res) {
    console.log('Request to patch user...');

    try {
        if (req.params.id === undefined) {
            res.status(400)
                .send();
        } else if (req.params.id !== req.authenticatedUserId) {
            res.status(401)
                .send();
        } else if (req.body.email !== undefined && !req.body.email.includes('@')) {
            res.status(400)
                .send('Bad email');
        } else if (req.body.password !== undefined && req.body.currentPassword === undefined) {
            res.status(400)
                .send();
        } else if (req.body.password !== undefined && req.body.password.length === 0) {
            res.status(400)
                .send();
        } else if (req.body.currentPassword !== undefined && req.body.currentPassword.length === 0) {
            res.status(400)
                .send();
        } else {
            const result = await users.updateUser(req.body, req.params.id);
            console.log(result);
            if (result === "Ok") {
                res.status(200)
                    .send();
            } else {
                res.status(400)
                    .send();
            }
        }
    } catch(err) {
        res.status(500)
            .send();
    }
};