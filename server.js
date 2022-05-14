const sqlConnection = require('./connector.js')
const express = require('express');
const encryption = require('./encrypt_decrypt.js')
const bodyPraser = require('body-parser');
const socketServer = require('socket.io');


var app = express();
app.use(bodyPraser.json());
app.use(express.json())
app.use(express.static('templates'));
var command = ``;
var toogle = true;

var task_table = "task_table";
var dateTableName = "date_month";
var masterTable = "master_table";
var books_table = "books_table";
var notdonetask_table = "notdonetask_table";
var pages_table = "pages_table";
var quotes_table = "quotes_table";
var advance_task = [];

var server = app.listen();

let io = socketServer(server);

app.get('/sendData', (req, res) => {
    let reqData = req.query.data_query;
    
    while(reqData.includes("t36i") || reqData.includes("8h3nk1") || reqData.includes("d3ink2")){
        reqData = reqData.replace("t36i", "+").replace("8h3nk1", "/").replace("d3ink2", "=");
    }
    reqData = encryption.decrypt(reqData)
    
    getDBData(reqData,function(rows){
        for(var i = 0; i<rows.length; i++){
            if(rows[i]["taskAddDate"] != undefined){
                rows[i]["taskAddDate"] = rows[i]["taskAddDate"].toLocaleString();
            }
        }
        let encryptedString = encryption.encrypt(JSON.stringify(rows));
        while(encryptedString.includes("+") || encryptedString.includes("/") || encryptedString.includes("=")){
            encryptedString = encryptedString.replace("+", "t36i").replace("/", "8h3nk1").replace("=", "d3ink2");
        }
        res.status(200).send(encryptedString);
    });
    
});

app.post('/getData', (req, res) => {
    var encryptedString = req.body["nameValuePairs"]["json"];
    let jsonData = JSON.parse(encryption.decrypt(encryptedString));
    if (jsonData.task != undefined) {
        addData(jsonData);
    }
    else if (jsonData.isDone != undefined) {
        getdone(jsonData);
    }
    else if (jsonData.clear != undefined) {
        Clear();
    }
    else if (jsonData.book != undefined) {
        add_book(jsonData.book, jsonData.pages);
    }
    else if (jsonData.quote != undefined) {
        command = `INSERT INTO ${quotes_table}(quoteName,isSend) VALUES("${jsonData.quote}",false)`;
        postData(command);
    }
    else if (jsonData.isPermanent != undefined){
        getPermanent(jsonData);
    }
    
});



function add_book(bookName, bookPages) {
    command = `INSERT INTO ${books_table} (bookName,bookPages,isDone) VALUES("${bookName}",${bookPages},false)`;
    sqlConnection.query(command, (err, rows, fields) => {
        if (!err) {
            getDBData(`SELECT taskName FROM ${task_table} WHERE TaskName = "add book"`, function (todayres) {
                var length = todayres.length;
                getDBData(`SELECT taskName FROM ${notdonetask_table} WHERE TaskName = "add book"`, function(notdoneRes){
                    length += notdoneRes.length;
                    if (length > 0) {
                        getPages(function (row) {
                            command = `SELECT * FROM ${pages_table} WHERE isSend = false LIMIT ${length}`;
                            getDBData(command, function (res) {
                                for (let index = 0; index < length; index++) {
                                    const element = res[index];
                                    var tableName = task_table;
                                    if(index <= length-todayres.length && index >= length-notdoneRes.length){
                                        tableName = notdonetask_table;
                                    }
                                    command = `UPDATE ${tableName} SET taskName = "${element["pagesForDay"]}" WHERE taskName = "add book" LIMIT 1`;
                                    postData(command);
                                    command = `UPDATE ${pages_table} SET isSend = true WHERE isSend = false LIMIT 1`
                                    postData(command);
                                }
                            })
                        })
                    }
                })
            })
            console.log("OK");
        }
        else {
            console.log(err);
        }
    });
}


function checkDateAndMonth() {
    command = `SELECT taskAddDate FROM ${task_table} WHERE isPermanent = 1`;
    var D = new Date()
    var currentDate = D.getDate();
    var currentMonth = D.getMonth();
    var currentYear = D.getFullYear()
    getDBData(command, (res) => {
        if (res.length > 0) {
            var databaseMonth = res[0]["taskAddDate"].getMonth();
            var databaseDate = res[0]["taskAddDate"].getDate();
            if (databaseMonth != currentMonth) {
                monthChanged();
                console.log("month changed")
            }
            else if (databaseDate != currentDate) {
                console.log("date changed")
                dateChanged();
            }
        }
    });
}

function deleteRows(Name) {
    postData(`DELETE FROM ${Name}`);
    postData(`ALTER TABLE ${Name} AUTO_INCREMENT = 1`);
}

function Clear() {
    command = `DELETE FROM ${task_table}`;
    postData(command);
    postData(`ALTER TABLE ${task_table} AUTO_INCREMENT = 1`);
}

function ResetTask(advance_task, permanent_task) {
    deleteRows(task_table);
    var pages = "add book";
    command = `SELECT pagesForDay FROM ${pages_table} WHERE isSend = false LIMIT 1`
    getDBData(command, function (res) {
        if (res.length > 0) {
            pages = res[0]["pagesForDay"]
            command = `UPDATE ${pages_table} SET isSend = true WHERE isSend = false LIMIT 1`
            postData(command);
        }
        permanent_task.push(pages);
        console.log(permanent_task);
        for (let index = 0; index < permanent_task.length; index++) {
            var isPermanent = true;
            if(index == permanent_task.length - 1){
                isPermanent = false;
            }
            var date = new Date();
            var addDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
            command = `INSERT INTO ${task_table} (TaskName,isDone,isNotDone,taskAddDate,taskDoneDate, isPermanent)
                        VALUES ("${permanent_task[index]}",false,false,'${addDate}',NULL, ${isPermanent})`;
            postData(command);
        }
        for (let index = 0; index < advance_task.length; index += 2) {
            const advance_taskName = advance_task[index];
            const advance_taskDate = advance_task[index + 1];
            command = `INSERT INTO ${task_table} (TaskName,isDone,isNotDone,taskAddDate,taskDoneDate, isPermanent)
                            VALUES ("${advance_taskName}",false,false,'${advance_taskDate}',NULL, false)`;
            postData(command);
        }
    })
}

function getPages(callback) {
    command = `SELECT * FROM ${books_table} WHERE isDone = false LIMIT 1`;
    getDBData(command, (row) => {
        if (row.length > 0) {
            var numberOfDays = (getNumOfDays() - (new Date().getDate() - 1));
            var bookPages = row[0]["bookPages"];
            var remainingPages = 0;
            var pagesPerDay = 0;
            var addPage = 0;
            var subPage = 0;
            var prePage = 0;
            var maxNum = getMaxNum(numberOfDays, 10, bookPages);
            for (let index = maxNum; index > 0; index--) {
                var element = numberOfDays * index;
                if (element <= bookPages) {
                    remainingPages = bookPages - element;
                    pagesPerDay = element / numberOfDays;
                    break;
                }
            }
            if (remainingPages > 0) {
                if (remainingPages <= numberOfDays) {
                    subPage = 1;
                }
                addPage = 0;
            }
            for (let index = 1; index < numberOfDays + 1; index++) {
                if (remainingPages > 0) {
                    remainingPages -= subPage;
                    addPage = subPage;
                }
                else {
                    addPage = 0;
                }
                command = `INSERT INTO ${pages_table} (pageID,pagesForDay,isDone,isSend,isNotDone)
                             VALUES(${index},"Read till pages no. ${prePage + pagesPerDay + addPage}",false,false,false)`;
                postData(command);
                prePage += pagesPerDay + addPage;
            }
            command = `UPDATE books_table
                SET isDone = true
                WHERE isDone = false
                LIMIT 1`;
            postData(command);
        }
        return callback("ok");
    })
}

function addData(Data) {
    command = `INSERT INTO ${task_table} (TaskName,isDone,isNotDone,taskAddDate, isPermanent)
                VALUES("${Data.task}",false,false,'${Data.date}', false)`;
    postData(command);
    console.log("ADDED");
}

function getdone(data) {
    var table = task_table;
    getDatabaseDate((doneDate)=>{
        if(parseInt(data.isNotDone) == 1){
            table = notdonetask_table;
        }
        command = `UPDATE ${table} SET isDone=true, taskDoneDate = '${doneDate}' WHERE taskID=${data.isDone}`
        postData(command);
        console.log("DONE");
    });
}

function monthChanged() {
    command = `SELECT taskName
                FROM ${task_table}
                WHERE TaskName LIKE "%pages%" AND isDone = true`;
    getDBData(command, function (res) {
        for (let index = 0; index < res.length; index++) {
            command = `UPDATE ${pages_table}
                        SET isDone = true
                        WHERE isDone = false AND pagesForDay = "${res[index]["taskName"]}"
                        LIMIT 1`;
            postData(command);
        }
        command = `UPDATE ${pages_table} SET isNotDone = true WHERE isDone = false`
        postData(command);
        command = `DELETE FROM ${pages_table} WHERE isDone = true`
        getPages(function (res) {
            dateChanged();
        });
    });
}

function dateChanged(currentYear = new Date().getFullYear(), currentMonth = new Date().getMonth(), currentDate = new Date().getDate()){
    var DateBase_Date = `${currentYear}-${currentMonth + 1}-${currentDate}`;
    
    postData(`UPDATE ${task_table} SET isNotDone = true WHERE isDone = false AND taskAddDate < '${DateBase_Date}' AND isPermanent = false`);
    postData(`DELETE FROM notdonetask_table where isDone = true`);

    command = `SELECT *
                FROM ${task_table}
                WHERE TaskName LIKE "%pages%" AND isDone = true`;

    getDBData(command, function (res) {
        for (let index = 0; index < res.length; index++) {
            command = `UPDATE ${pages_table}
                            SET isDone = true
                            WHERE isDone = false AND pagesForDay = "${res[index]["taskName"]}"
                            LIMIT 1`;
            postData(command);
        }
    });

    command = `INSERT INTO notdonetask_table (taskName, isDone, isNotDone, taskAddDate, taskDoneDate, isPermanent)
                SELECT taskName, isDone, isNotDone, taskAddDate, taskDoneDate, isPermanent
                FROM task_table
                WHERE isNotDone = 1;`;
    postData(command);

    command = `SELECT * FROM ${task_table} WHERE (isNotDone = false AND isDone = false) OR isPermanent = true`;
    getDBData(command, function (res) {
        var advance_task = [];
        var permanent_task = [];
        for (let index = 0; index < res.length; index++) {
            const element = res[index];
            var addDate = `${element["taskAddDate"].getFullYear()}-${element["taskAddDate"].getMonth() + 1}-${element["taskAddDate"].getDate()}`;
            var taskName = element["taskName"];
            if(parseInt(element["isPermanent"]) == 0){
                advance_task.push(taskName);
                advance_task.push(addDate);
            }
            else{
                permanent_task.push(taskName);
            }
        }
        ResetTask(advance_task, permanent_task);
    });
}

function getPermanent(data){
    command = `UPDATE ${task_table} SET isPermanent = ${data.isPermanent} WHERE taskName = "${data.taskName}"`;
    postData(command);
}

io.sockets.on("connection", (socket) => {
    socket.on("req", giveData);
    socket.on("done", getdone);
    socket.on("add", addData)
    socket.on("clear", Clear)
    socket.on("master", giveMaster)

    function giveData() {
        command = `SELECT * FROM ${task_table}`;
        getDBData(command, function (res) {
            socket.emit("data", res);
        })
    }

    function giveMaster() {
        command = `SELECT * FROM ${masterTable} WHERE isMaster = true`;
        getDBData(command, function (res) {
            socket.emit("Master", res);
        });
    }
});

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
function getMaxNum(numberOfDays, maxNum, bookPages){
    if(numberOfDays*maxNum < bookPages){
        maxNum += 10;
        return getMaxNum(numberOfDays, maxNum, bookPages)
    }
    else{
        return maxNum;
    }
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

function getDatabaseDate(callback){
    command = `SELECT taskAddDate FROM ${task_table} WHERE isPermanent = 1`;
    getDBData(command, (res)=>{
        var date = new Date();
        if(res.length > 0){
            date = res[0]["taskAddDate"];
        }
        var databaseMonth = date.getMonth();
        var databaseDate = date.getDate();
        var databaseYear = date.getFullYear();
        var currentDate = `${databaseYear}-${databaseMonth + 1}-${databaseDate}`;
        return callback(currentDate);
    })
}

setTimeout(()=>{
    setInterval(function () {
        checkDateAndMonth()
    }, 750);
}, 10000)


function getNumOfDays() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}
