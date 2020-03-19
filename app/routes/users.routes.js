const users = require('../controllers/users.controller');

module.exports = function(app) {
    app.route(app.rootUrl + '/users/register')
        .post(users.create)
    app.route(app.rootUrl + '/users/login')
        .post(users.login);
};