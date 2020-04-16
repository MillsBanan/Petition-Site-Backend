const photo = require('../controllers/users.photos.controller');
const auth = require('../middleware/authenticate.middleware');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/:id/photo')
        .get(photo.getPhoto)
        .put(auth.loginRequired, photo.putPhoto)
        .delete(auth.loginRequired, photo.deletePhoto);
};