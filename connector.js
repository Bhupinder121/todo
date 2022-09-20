const mysql = require('mysql');

var mysqlConnection = mysql.createConnection({
    host: "remainderdatabase.cmvat6qvy1bw.ap-south-1.rds.amazonaws.com",
    user: "admin",
    password: "awsMaster",
    database: "remainderdb",
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
