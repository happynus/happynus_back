const express = require("express");
const morgan = require("morgan");
const path = require("path");
const app = express();
var cookieParser = require("cookie-parser");
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
const PORT = process.env.PORT || 5000;

app.use(morgan("dev"));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname + "/public")));

// 세션 설정
app.use(
  session({
    key: "hnduty",
    secret: "nextlevel",
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({
      host: "mysql-hnduty.mysql.database.azure.com",
      port: "3306",
      user: "hnadmin",
      password: "hn!753159",
      database: "session",
    }),
  })
);

//Router_zone
//logIn
var login = require("./routes/logInNOut.js");
app.use("/", login);
//logOut
var logout = require("./routes/logInNOut.js");
app.use("/", logout);

var superMain = require("./routes/mainpage.js");
app.use("/", superMain);

var dutyMain = require("./routes/mainpage.js");
app.use("/", dutyMain);

var normalMain = require("./routes/mainpage.js");
app.use("/", normalMain);

//shiftTable
var shiftTable = require("./routes/shiftTable.js");
app.use("/", shiftTable);

//nightTurnAPI
var nightTurn = require("./routes/nightTurn.js");
app.use("/", nightTurn);

var finalAssign = require('./routes/finalAssign.js');
app.use('/', finalAssign);

var level = require('./routes/level.js');
app.use('/', level);

var wanted = require('./routes/wanted.js');
app.use('/', wanted);

var myDuty = require('./routes/mainpage.js');
app.use('/', myDuty);

var empManage = require('./routes/mainpage.js');
app.use('/', empManage);

app.listen(PORT, () => {
  console.log(`BackServer run : http://localhost:${PORT}/`);
});