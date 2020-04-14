const signatures = require('../models/petitions.signatures.model');

exports.listSignatures = async function (req, res) {
    console.log("Request to view all signatures of a petition...")

    try {
        if (req.params.id === undefined) {
            res.status(404)
                .send();
        } else if (await signatures.petitionNotExists(req.params.id)) {
            res.status(404)
                .send();
        } else {
            const result = await signatures.getSignatures(req.params.id);
            res.status(200)
                .send(result);
        }
    } catch(err) {
        res.status(500)
            .send();
    }
};

exports.signPetition = async function (req, res) {
    console.log(`Request to sign petition: ${req.params.id}`);

    try {
        if (req.params.id === undefined) {
            res.status(404)
                .send();
        } else if (await signatures.petitionNotExists(req.params.id)) {
            res.status(404)
                .send();
        } else if (await signatures.petitionClosed(req.params.id)) {
            res.status(403)
                .send();
        } else if (await signatures.alreadySigned(req.authenticatedUserId, req.params.id)) {
            res.status(403)
                .send();
        } else {
            const result = await signatures.signPetition(req.authenticatedUserId, req.params.id);
            if (result.affectedRows === 1) {
                res.status(201)
                    .send();
            } else {
                res.status(404)
                    .send()
            }
        }
    } catch(err) {
        res.status(500)
            .send();
    }
};

exports.removeSignature = async function (req, res) {
    console.log("Request to remove a signature from petition...");

    try {
        if (req.params.id === undefined) {
            res.status(404)
                .send();
        } else if (await signatures.petitionNotExists(req.params.id)) {
            res.status(404)
                .send();
        } else if (await signatures.petitionClosed(req.params.id)) {
            res.status(403)
                .send();
        } else if (!await signatures.alreadySigned(req.authenticatedUserId, req.params.id)) {
            res.status(403)
                .send();
        } else if (await signatures.userIsAuthor(req.authenticatedUserId, req.params.id)) {
            res.status(403)
                .send();
        } else {
            const result = await signatures.deleteSignature(req.authenticatedUserId, req.params.id);
            if (result.affectedRows === 1) {
                res.status(200)
                    .send();
            } else {
                res.status(404)
                    .send()
            }
        }
    } catch(err) {
        res.status(500)
            .send();
    }
};