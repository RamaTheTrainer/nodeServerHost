//var promise = require('bluebird');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

// var options = {
//     // Initialization Options
//     promiseLib: promise
// };

// var pgp = require('pg-promise')(options);
// var cs = 'postgres://postgres:rama@123@localhost:5432/konneqtochat';

var Users = [
    { userName: "Unic", socketId: "120" },
    { userName: "Praveen", socketId: "130" }
];


app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "*");
    return next();
});

function SaveChatData(fUser,tUser,msg){
    var dt = new Date();
    var db = pgp(cs);
    db.none("insert into chatInfo(frmuser,touser,msg,datetime) values($1,$2,$3,$4)", [fUser,tUser,msg,dt.toLocaleDateString()+'|'+ dt.toTimeString()]).then((data) => {
        console.log('caht saved to db ..')
    })
    pgp.end();
}


app.get('/', function (req, res) {
    res.send(Users);
});

app.get('/:fUser/:tUser', function (req, res) {
    // fu = req.params.fUser;
    // tu = req.params.tUser;
    // var db = pgp(cs);
    // // db.any("select * from chatinfo where (frmuser=$1 and touser =$2) or (frmuser=$2 and touser=$1) ", [fu,tu]).then((data) => {
    //     res.send(data);
    // })
    // pgp.end();

});


io.on('connection', function (socket) {
    var uname = socket.handshake.query.userName;
    var sid = socket.id;
    Users.push({ userName: uname, socketId: sid });
    io.emit('newUsers', { user: uname });
    console.log('User Added...' + uname);
    socket.on('disconnect', function () {
        disId = socket.id;
        console.log('disconnected id : ' + socket.id)
        
        var disUindex = 0;
        i = 0
        Users.forEach(element => {

            if (element.socketId == disId) {
                udisname = element.userName;
                disUindex = i;
            }
            i++;
        });
        console.log("user Index to :" + disUindex);

        Users.splice(disUindex, 1);

        // var i = Users.findIndex(disUser)
        // console.log("Index to disocnnect .." + i)
        // Users.splice(i, 1)

        console.log(JSON.stringify(Users));
    })
    socket.on('addmsg', function (data) {
        var ar = data.split('|')
        msg = ar[0];
        fUser = ar[1];
        tUser = ar[2];
        toSessionId = ""
        Users.forEach(element => {
            if (element.userName == tUser) {
                toSessionId = element.socketId;
            }
        });

        console.log("Session di To send :: " + toSessionId + "Message is : " + msg);
        socket.broadcast.to(toSessionId).emit('sendClient', { user: fUser, msg: ar[0] });
        //SaveChatData(fUser,tUser,msg);
    });
});

http.listen(5000, function () {
    console.log('listening on localhost:http://localhost:5000');
});


