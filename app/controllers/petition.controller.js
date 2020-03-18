const petition = require('../models/petition.model');

exports.list = async function(req, res) {

    console.log('\nRequest to list all of the petitions...');

    const queryParams = {
        "q": req.query.q,
        "categoryId": req.query.categoryId,
        "authorId": req.query.authorId,
        "sortBy": req.query.sortBy,
        "count": req.query.count,
        "startIndex": req.query.startIndex
    };
    try {
        checkListQueryParams(queryParams);
    } catch {
        res.status(400)
            .send(`ERROR listing petitions`);
    }

    try {
        const result = await petition.getAll(queryParams);
        res.status(200)
            .send(result);
    } catch(err) {
        res.status(500)
            .send(`ERROR listing petitions: ${err}`);
    }
};

function checkListQueryParams(queryParams) {

    if (queryParams.categoryId !== undefined && !(Number.isInteger(parseFloat(queryParams.categoryId)))) {
        throw "Value given for categoryId is not an integer!";

    } else if (queryParams.authorId !== undefined && !(Number.isInteger(parseFloat(queryParams.authorId)))) {
        throw "Value given for authorId is not an integer!";

    } else if (queryParams.sortBy !== undefined && !(["SIGNATURES_DESC", "SIGNATURES_ASC",
                "ALPHABETICAL_DESC", "ALPHABETICAL_ASC"].includes(queryParams.sortBy))) {
        throw "Value given to sort by was invalid!";
    }
}


exports.create = async function(req, res) {

    console.log('\nRequest to create a new petition...');

    let body = req.body;
    const auth_token = req.headers['x-authorization'];
    console.log(auth_token);

    try {
        checkDateTime(body.closingDate);
    } catch {
        res.status(400)
            .send("Bruh");
    }

    try {
        const result = await petition.insert(author_id, body);
        res.status(200)
            .send(result);
    } catch (err) {
        res.status(500)
            .send(`ERROR creating petition: ${err}`);
    }

};

function checkDateTime (dateTime) {

    const date = dateTime.slice(0,10);
    const time = dateTime.slice(11,19);
    if (!(Date.now() < Date.parse(date + 'T' + time + 'Z'))) {
        throw "Bruh";
    }
}