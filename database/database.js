const mysql = require('mysql');
const { promisify } = require('util');
const { database } = require('../config/BDcredentials');

const pool  = mysql.createPool(database);

pool.getConnection((err, conection) => {
    if(err){
        console.log(err);
    }
    if(conection){
        conection.release();
        console.log("DB connected");
    }
});

pool.query = promisify(pool.query);

module.exports = pool;