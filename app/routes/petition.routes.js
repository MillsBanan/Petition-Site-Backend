const petition = require('../controllers/petition.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions')
        .get(petition.list)
        .post(petition.create);

};