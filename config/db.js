const mysql = require("mysql");

const db = mysql.createConnection({
    host: "us-cdbr-east-04.cleardb.com",
    user: "b538e41d5d7bab",
    password: "dd2c0d02",
    database: "SocialMedia",
});

module.exports = db;