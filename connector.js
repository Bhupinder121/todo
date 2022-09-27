const mysql = require('mysql');

var mysqlConnection = mysql.createConnection({
    host: "",
    user: "",
    password: "",
    database: "",
    multipleStatements: true
});

mysqlConnection.connect((err) => {
    if (!err) {
        console.log("connected");

    }
    else {
        console.log(err);
        console.log("Not connected");
    }
});

module.exports = mysqlConnection;
