const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 5000;

app.use(morgan('dev'));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname+ '/public')));

let isDisableKeepAlive = false
app.use(function(req, res, next) {
  if (isDisableKeepAlive) {
    res.set(`Connection`, `close`)
  }
  next()
})

//View_zone
// app.get('/', function (req, res) {
//   res.sendFile(path.join(__dirname+ '/screen/mainPage.html'));
// });

//Router_zone
var empManageAPI = require('./routes/empManageAPI.js');
app.use('/', empManageAPI);

//shiftTable배치를 위한 요소들을 모아논 라우트
var shiftTableElement = require('./routes/shiftTableElement.js');
app.use('/', shiftTableElement);

//logInNOut
var login = require('./routes/logInNOutWanted.js');
app.use('/', login);

var logout = require('./routes/logInNOutWanted.js');
app.use('/', logout);

var superMain = require('./routes/mainpage.js');
app.use('/', superMain);

var dutyMain = require('./routes/mainpage.js');
app.use('/', dutyMain);

var normalMain = require('./routes/mainpage.js');
app.use('/', normalMain);

//shiftTable을 위한 API
var shiftTable = require('./routes/shiftTable.js');
app.use('/', shiftTable);

//nightTurnAPI
var nightTurn = require('./routes/nightTurn.js');
app.use('/', nightTurn);

//test
var nao = require('./routes/nightAndOff.js');
app.use('/', nao);


app.listen(PORT, () => {
  process.send(`ready`)
  console.log(`BackServer run : http://localhost:${PORT}/`)
})

process.on(`SIGINT`, function () {
  isDisableKeepAlive = true
  app.close(function () {
  console.log(`server closed`)
  process.exit(0)
  })
})