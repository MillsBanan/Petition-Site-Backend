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
        let start = 0;
        let finish = result.length;
        if (queryParams.startIndex !== undefined ) {
            start = parseInt(queryParams.startIndex);
        }
        if (queryParams.count !== undefined) {
            finish = queryParams.count;
        }
        res.status(200)
            .send(result.slice(start, finish + 1));
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
    let petitionData = req.body;
    petitionData["authorId"] = req.authenticatedUserId;

    try {
        if (petitionData.title === undefined || petitionData.description === undefined ||
                petitionData.categoryId === undefined || petitionData.closingDate === undefined) {
            res.status(400)
                .send();
        } else if (Date.now() > Date.parse(petitionData.closingDate)) {
            res.status(400)
                .send();
        } else if (await petition.categoryInvalid(petitionData.categoryId)) {
            res.status(400)
                .send();
        } else {
            const [result] = await petition.insert(petitionData);
            res.status(201)
                .send(result);
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR creating petition: ${err}`);
    }

};
