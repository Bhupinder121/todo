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
