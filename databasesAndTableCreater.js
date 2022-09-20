let tableListRemainder = [];
let tableListFinance = [];
let remainderTables = ["task_table", "notdonetask_table", "books_table", "quotes_table", "pages_table"];
const sqlConnection = require('./connector.js')


checkDatabase((state)=>{
    // if(state==""){
    //     postData("CREATE SCHEMA remainderdb");
    //     postData("CREATE SCHEMA financeapp");
    // }
    // else if(state=="remainderdb"){
    //     postData("CREATE SCHEMA financeapp");
    // }
    // else if(state=="financeapp"){
    //     postData("CREATE SCHEMA remainderdb");
    // }
    checkRemainderTables();
    // checkFinanceTales()
});

function checkFinanceTales(){
    changeDatabase("financeapp");
    getDBData("show tables ", (rows)=>{
        tableListFinance = [];
        for (let index = 0; index < rows.length; index++) {
            const element = rows[index]["Tables_in_financeapp"];
            tableListFinance.push(element);
        }
        if(!tableListFinance.includes("exp_category")){
            let command = "CREATE TABLE `financeapp`.`exp_category` (\n\
                `ID` INT NOT NULL AUTO_INCREMENT,\n\
                `date` DATE NULL,\n\
                `ExpAmt` INT NULL,\n\
                `ExpCate` VARCHAR(255) NULL,\n\
                PRIMARY KEY (`ID`))";
            postData(command);
        }
    });
}

function checkRemainderTables(){
    // changeDatabase("remainderdb");
    getDBData("show tables ", (rows)=>{
        tableListRemainder = [];
        for (let index = 0; index < rows.length; index++) {
            const element = rows[index]["Tables_in_remainderdb"];
            tableListRemainder.push(element);
        }
        for(let i = 0; i < remainderTables.length; i++){
            let tableName = remainderTables[i];
            if(!tableListRemainder.includes(tableName)){
                let command = ``;
                switch (tableName){
                    case "task_table":
                        command = "CREATE TABLE `remainderdb`.`task_table` (\n\
                            `taskID` INT NOT NULL AUTO_INCREMENT,\n\
                            `taskName` VARCHAR(255) NULL,\n\
                            `isDone` TINYINT NULL,\n\
                            `isNotDone` TINYINT NULL,\n\
                            `taskAddDate` DATE NULL,\n\
                            `taskDoneDate` DATE NULL,\n\
                            `isPermanent` TINYINT NULL,\n\
                            PRIMARY KEY (`taskID`))"
                        break;
                    case "notdonetask_table":
                        command = "CREATE TABLE `remainderdb`.`notdonetask_table` (\n\
                            `taskID` INT NOT NULL AUTO_INCREMENT,\n\
                            `taskName` VARCHAR(255) NULL,\n\
                            `isDone` TINYINT NULL,\n\
                            `isNotDone` TINYINT NULL,\n\
                            `taskAddDate` DATE NULL,\n\
                            `taskDoneDate` DATE NULL,\n\
                            `isPermanent` TINYINT NULL,\n\
                            PRIMARY KEY (`taskID`))"
                        break;
                    case "quotes_table":
                        command = "CREATE TABLE `remainderdb`.`quotes_table` (\n\
                            `quoteID` INT NOT NULL AUTO_INCREMENT,\n\
                            `quoteName` VARCHAR(500) NULL,\n\
                            `isSend` TINYINT NULL,\n\
                            PRIMARY KEY (`quoteID`))";
                        break;
                    case "books_table":
                        command = "CREATE TABLE `remainderdb`.`books_table` (\n\
                            `bookID` INT NOT NULL AUTO_INCREMENT,\n\
                            `bookName` VARCHAR(255) NULL,\n\
                            `bookPages` INT NULL,\n\
                            `isDone` TINYINT NULL,\n\
                            PRIMARY KEY (`bookID`))";
                        break;
                    case "pages_table":
                        command = "CREATE TABLE `remainderdb`.`pages_table` (\n\
                            `pageID` INT NULL,\n\
                            `pagesForDay` VARCHAR(300) NULL,\n\
                            `isDone` INT NULL,\n\
                            `isSend` INT NULL,\n\
                            `isNotDone` INT NULL)"
                        break;
                    
                }
                postData(command);
            }
        }
        
    })
}

function changeDatabase(databaseName){
    sqlConnection.changeUser({database: databaseName}, (err)=>{
        if (err) throw err;
    })
}


function checkDatabase(callback){
    getDBData("SHOW DATABASES", (rows)=>{
        let count = "";
        for(let i = 0; i<rows.length; i++){
            let databaseName = rows[i]["Database"];
            if(databaseName == "remainderdb"){
                if(count == ""){
                    count = "remainderdb";
                }
                else{
                    count = "dual";
                }
            }
            else if(databaseName == "financeapp"){
                if(count == ""){
                    count = "financeapp";
                }
                else{
                    count = "dual";
                }
            }
        }
        return callback(count);
    });
}


function getDBData(command, callback) {
    sqlConnection.query(command, (err, rows, fields) => {
        if (!err) {
            return callback(rows);
        }
        else {
            console.log(err);
        }
    });
}

function postData(command) {
    sqlConnection.query(command, (err, rows, fields) => {
        if (!err) {
            console.log("OK");
        }
        else {
            console.log(err);
        }
    });
}
