const petition = require('../controllers/petition.controller');
const auth = require('../middleware/authenticate.middleware');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions')
        .get(petition.list)
        .post(auth.loginRequired, petition.create);
    app.route(app.rootUrl + '/petitions/:id')
        .get(petition.listOne)
        .patch(auth.loginRequired, petition.patchPetition);
        // .delete(auth.authUser, petition.remove);
};