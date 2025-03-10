const PUERTO = process.env.PORT;

// BASE DE DATOS
const DB_HOST = process.env.HOSTDB;
const DB_PORT = process.env.PORTDB;
const DB_NAME = process.env.DB;
const DB_USER = process.env.USERDB;
const DB_PASSWORD = process.env.PASSWORDDB;

module.exports = {
    PUERTO,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD
};
