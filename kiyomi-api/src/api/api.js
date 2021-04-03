const database = require('./database');
const routes = require('./routes');

const db_connection_options = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

const db = database(db_connection_options);

module.exports = function (express) {

    return function() {
        const router = express.Router();
        router.use(express.json());
        routes(router, db);

        return router;
    }
}