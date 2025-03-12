const PUERTO = process.env.PORT;

// BASE DE DATOS
const DB_HOST = 'localhost'//'mysql-aba0.railway.internal'//'localhost'//process.env.HOSTDB;
const DB_PORT = 3306//process.env.PORTDB;
const DB_NAME = 'railway'//process.env.DB;
const DB_USER = 'root'//process.env.USERDB;
const DB_PASSWORD = 'root'//'aIrDMWaeYaHFpVaQwxrkhWgGqSoITrcn'//'root'//process.env.PASSWORDDB;   

module.exports = {
    PUERTO,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD
};
