
var socket;
var data = [];
var doneWork = [];
var notDoneWork = [];
var notDoneWorkDone = [];
let str = "";
var runTime = 0;


socket = io()

function getAndUpdate() {
    title = document.getElementById('title').value;
    if (title != '') {
        socket.emit("add", title)
        document.getElementById('title').value = '';
        update();
    }
}


function checkData(Data) {
    let str = ``;
    let tableBody = document.getElementById("tableBody");
    let count = 1;
    for (let index = 0; index < Data.length; index++) {
        const element = Data[index];
        var DONE = '';
        var disable = '';
        if (element["isNotDone"] == 0) {
            if (element["isDone"] == 1) {
                DONE = 'style="text-decoration-line: line-through;"';
                disable = 'type="button" disabled';
            }
            str += `
                <tr>
                <th scope="row">${count}</th>
                <td id="work${element["taskID"]}" ${DONE}>${element["taskName"]}</td>
                <td><button class="button" onclick="deleted(${element["taskID"]})" id="btn${element["taskID"]}" ${disable}>Done</button></td> 
                </tr>`;
            count += 1;
        }
    }
    count = 1;
    var toggle = false;
    for (let index = 0; index < Data.length; index++) {
        const element = Data[index];
        if (element["isNotDone"] == 1) {
            if (!toggle) {
                toggle = true;
                str += `<b>Not Done Work</b>`;
            }
            var DONE = '';
            var disable = '';
            if (element["isDone"] == 1) {
                DONE = 'style="text-decoration-line: line-through;"';
                disable = 'type="button" disabled';
            }
            str += `
                <tr>
                <th scope="row">${count}</th>
                <td id="work${element["taskID"]}" ${DONE}>${element["taskName"]}</td>
                <td><button class="button" onclick="deleted(${element["taskID"]})" id="btn${element["taskID"]}" ${disable}>Done</button></td> 
                </tr>`;
            count += 1;
        }

    }

    tableBody.innerHTML = str;
}

function checkDoneWork(Data) {
    doneWork = Data;
}


function update() {
    socket.emit("master","master");
    socket.on("Master",getMaster)
    socket.emit("req", "req");
    socket.on("data", checkData);
}


function getMaster(Data){
    CheckMaster = document.getElementById("con");
    mStr = ``;
    for (let index = 0; index < Data.length; index++) {
        // const element = Data[index];
        if(index==0){
            mStr = `<img src="fist.png" alt="Trulli" width="50" height="30">`
        }
        else{
            mStr = `<img src="fist.png" alt="Trulli" width="50" height="30"><p id="cou">+${index}</p>`
        }
    }
    CheckMaster.innerHTML = mStr;
}

update()


function deleted(itemIndex) {
    var index = itemIndex.toString();
    itemJsonArray = data;
    doneWork.push(itemIndex);
    // itemJsonArray.splice(itemIndex, 1);
    document.getElementById("work" + index).style.textDecorationLine = "line-through";
    document.getElementById("btn" + index).disabled = true;
    socket.emit("done", itemIndex);
    update();
}

function clearStorage() {
    if (confirm("Do you really want to clear?")) {
        socket.emit("clear", "clear");
        update();
    }
}


setInterval(function () {
    update()
}, 750);