const photo = require('../models/petitions.photos.model');
const fs = require('mz/fs');
const photosDirectory = __dirname + '../../../storage/photos/';
const path = require('path');

exports.getPhoto = async function (req, res) {
    console.log('Request to view a petition photo...');

    try {
        if (req.params.id === undefined) {
            res.status(404)
                .send();
        } else if (!await photo.petitionExists(req.params.id)) {
            res.status(404)
                .send();
        } else {
            const filename = await photo.viewPhoto(req.params.id);
            if (filename === null) {
                res.status(404)
                    .send();
            } else {
                const mimeType = 'image/' + filename.split('.').pop();

                if (await fs.exists(path.resolve(photosDirectory + filename))) {
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