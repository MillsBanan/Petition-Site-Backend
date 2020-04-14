const signatures = require('../controllers/petitions.signatures.controller');
const auth = require('../middleware/authenticate.middleware');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(signatures.listSignatures)
        .post(auth.loginRequired, signatures.signPetition)
        .delete(auth.loginRequired, signatures.removeSignature);
}