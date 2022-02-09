const sqlConnection = require('./connector.js');
const bodyPraser = require('body-parser');
const { spawn } = require('child_process');
const e = require('express');

var task_table = "task_table";
var dateTableName = "date_month";
var masterTable = "master_table";
var books_table = "books_table";
var pages_table = "pages_table";
var command = ``;
var DateBase_Date = `2021-08-1`;


// var date = new Date(DateBase_Date);
// var date = new Date();
// var DateBase_Date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1}`;
// console.log(DateBase_Date)
// var doneDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
test(h=4)

function test(h=null){
    console.log(h)
}

var date = new Date();
var DateBase_Date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate() + 1}`;
// getDBData(`SELECT taskAddDate FROM ${task_table} `, function (res){
//     for (let index = 0; index < res.length; index++) {
//         const element = res[index];
//         element["taskAddDate"] = element["taskAddDate"].toLocaleString()
//         console.log(element);
//     }
// });


function changePages() {
    getDBData(`SELECT * FROM ${task_table} WHERE TaskName = "add book"`, function (res) {
        if (res.length != 0) {
            command = `SELECT * FROM ${pages_table} WHERE isSend = false LIMIT ${res.length}`;
            getDBData(command, function (res) {
                for (let index = 0; index < res.length; index++) {
                    const element = res[index];
                    command = `UPDATE ${task_table} SET TaskName = "${element["pagesForDay"]}" WHERE TaskName = "add book" LIMIT 1`;
                    postData(command);
                    command = `UPDATE ${pages_table} SET isSend = true WHERE isSend = false LIMIT 1`
                    postData(command);
                }
            })
        }
    })
}


function ResetMaster() {
    command = `DELETE FROM ${masterTable}`
    postData(command);
    for (let index = 0; index < 8; index++) {
        command = `INSERT INTO ${masterTable} (masterID,isMaster,masterDate) VALUES (${index},false,NULL)`
        postData(command);
    }
}

function getdone(data) {
    var date = new Date();
    var doneDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    command = `UPDATE ${tableName} SET isDone=true, taskDoneDate = '${doneDate}' WHERE taskID=${data}`
    postData(command);
    console.log("DONE");
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

function deleteRows(tableName) {
    postData(`DELETE FROM ${tableName}`);
    postData(`ALTER TABLE ${tableName} AUTO_INCREMENT = 1`);
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

function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}


