const photo = require('../models/users.photos.model');
const fs = require('mz/fs');
const photosDirectory = __dirname + '/../../storage/photos/';
const path = require('path');
const tools = require('../helpers/tools.helper');

exports.getPhoto = async function (req, res) {
    console.log('Request to view a petition photo...');

    try {
        if (req.params.id === undefined) {
            res.status(404)
                .send();
        } else if (!await photo.userExists(req.params.id)) {
            res.status(404)
                .send();
        } else {
            const filename = await photo.viewPhoto(req.params.id);
            if (filename === null) {
                res.status(404)
                    .send();
            } else {
                const mimeType = tools.getMimeType(filename);
                if (mimeType === null) {
                    res.status(404)
                        .send();
                } else if (await fs.exists(path.resolve(photosDirectory + filename))) {
                    res.status(200)
                        .contentType(mimeType)
                        .sendFile(path.resolve(photosDirectory + filename));
                } else {
                    res.status(404)
                        .send();
                }
            }
        }
    } catch(err) {
        res.status(500)
    }
};

exports.putPhoto = async function (req, res) {
    console.log("Request to upload photo for user...");

    try {
        if (req.params.id !== req.authenticatedUserId) {
            res.status(403)
                .send();
        } else if (!tools.theMimeIsRight(req.headers["content-type"])) {
            res.status(400)
                .send('BadMime');
        } else {
            const filename = 'user_' + req.params.id + '_' + req.authenticatedUserId +
                new Date().toISOString().slice(0,19) + '.' + req.headers["content-type"].split('/')[1];
            req.pipe(fs.createWriteStream(photosDirectory + filename));
            const code = await photo.updatePhoto(req.params.id, filename);
            res.status(code)
                .send();
        }
    } catch(err) {
        res.status(500)
            .send();
    }

};
