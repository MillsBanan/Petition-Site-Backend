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
            finish = parseInt(queryParams.count);
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
                petitionData.categoryId === undefined) {
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
                .send({"petitionId": result["petition_id"]});
        }
    } catch (err) {
        res.status(500)
            .send(`ERROR creating petition: ${err}`);
    }
};

exports.listOne = async function (req, res) {
    console.log("yeetus");
    try {
        if (req.params.id === undefined) {
            res.status(404)
                .send();
        } else if (await petition.petitionNotExists(req.params.id)) {
            res.status(404)
                .send();
        } else {
            const result = await petition.getOne(req.params.id);
            if (result.length === 0) {
                res.status(404)
                    .send();
            } else {
                res.status(200)
                    .send(result[0]);
            }
        }
    } catch(err) {
        res.status(500)
            .send();
    }
};

exports.patchPetition = async function (req, res) {
    console.log("Request to update a petition");

    try {
        if (req.params.id === undefined) {
            res.status(400)
                .send();
        } else if (await petition.petitionNotExists(req.params.id)) {
            res.status(404)
                .send();
        } else if (!await petition.userIsAuthor(req.authenticatedUserId, req.params.id)) {
            res.status(403)
                .send();
        } else if (await petition.petitionClosed(req.params.id)) {
            res.status(403)
                .send();
        } else if (req.body.title === undefined && req.body.description === undefined && req.body.categoryId === undefined &&
            req.body.closingDate === undefined) {
            res.status(400)
                .send();
        } else if (req.body.categoryId !== undefined && await petition.categoryInvalid(req.body.categoryId)) {
            res.status(400)
                .send();
        } else if (req.body.closingDate !== undefined && Date.now() > Date.parse(req.body.closingDate)) {
            res.status(400)
                .send();
        } else {
            const result = await petition.update(req.body, req.params.id);
            if (result.affectedRows === 1) {
                res.status(200)
                    .send();
            } else {
                res.status(404)
                    .send();
            }
        }
    } catch(err) {
        res.status(500)
            .send();
    }
};

exports.remove = async function (req, res) {
    console.log("Request to delete a petition...");

    try {
        if (await petition.petitionNotExists(req.params.id)) {
            res.status(404)
                .send();
        } else if (!await petition.userIsAuthor(req.authenticatedUserId, req.params.id)) {
            res.status(403)
                .send();
        } else {
            const result = await petition.delete(req.params.id);
            if (result.affectedRows !== 0) {
                res.status(200)
                    .send();
            } else {
                res.status(404)
                    .send();
            }
        }
    } catch(err) {
        res.status(500)
            .send();
    }
};

exports.listCategories = async function (req, res) {
    console.log("Request to list all information about categories...");

    try {
        const result = await petition.getCategories();
        console.log(result);
        res.send(result);
    } catch(err) {
        res.status(500)
            .send();
    }
};