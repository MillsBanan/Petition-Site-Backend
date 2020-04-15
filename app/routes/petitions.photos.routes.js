const photo = require('../controllers/petitions.photos.controller');
const auth = require('../middleware/authenticate.middleware');


module.exports = function(app) {
    app.route(app.rootUrl + '/petitions/:id/photo')
        .get(photo.getPhoto);
};