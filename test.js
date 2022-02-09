const sqlConnection = require('./connector.js')
const express = require('express');
const encryption = require('D:/Projects/encrypt/encrypt_decrypt.js')
const bodyPraser = require('body-parser');


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


deleteRows(pages_table);
add_book("tasfksjff", 69);
// checkDateAndMonth();
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
            console.log(numberOfDays);
            for (let index = maxNum; index > 0; index--) {
                var element = numberOfDays * index;
                if (element <= bookPages) {
                    console.log(element);
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

function getMaxNum(numberOfDays, maxNum, bookPages){
    if(numberOfDays*maxNum < bookPages){
        maxNum += 10;
        return getMaxNum(numberOfDays, maxNum, bookPages)
    }
    else{
        return maxNum;
    }
}

function getNumOfDays() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function deleteRows(Name) {
    postData(`DELETE FROM ${Name}`);
    postData(`ALTER TABLE ${Name} AUTO_INCREMENT = 1`);
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