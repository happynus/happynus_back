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
    cookie: {
      httpOnly: false
    },
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
var empManageAPI = require("./routes/empManageAPI.js");
app.use("/", empManageAPI);

//logIn
var login = require("./routes/logInNOut.js");
app.use("/", login);
//logOut
var logout = require("./routes/logInNOut.js");
app.use("/", logout);

// 해피너스의 여러가지 페이지를 관리하는 API
var mainpage = require("./routes/mainpage.js");
app.use("/", mainpage);

// var empManage = require('./routes/mainpage.js');
// app.use('/', empManage);


//shiftTable
var shiftTable = require("./routes/shiftTable.js");
app.use("/", shiftTable);

//시프트 테이블에서 버튼 없앤 API
var shiftTableCk = require("./routes/shiftTableCk.js");
app.use("/", shiftTableCk);

//듀티 한줄만 출력하기위한 위한 테이블
var myDutyTable = require("./routes/myDutyTable.js");
app.use("/", myDutyTable);


//룰 API 모음
//nightTurnAPI
var nightTurn = require("./routes/nightTurn.js");
app.use("/", nightTurn);

var wanted = require("./routes/wanted.js");
app.use("/", wanted);

var finalAssign = require('./routes/finalAssign.js');
app.use('/', finalAssign);

var level = require('./routes/level.js');
app.use('/', level);


app.listen(PORT, () => {
  console.log(`BackServer run : http://localhost:${PORT}/`);
});