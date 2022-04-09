const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var fs = require("fs");
var mysql = require("mysql");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
//const path = require('path');
const { connection } = require("../config/dao.js");
const { cookie } = require("express/lib/response");

/**
 * 파일 명 : login.js
 * @author : 문승연
 * @date : 2022-04-05
 * @description : 로그인/아웃 구현
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(
  session({
    key: "hnduty",
    secret: "nextlevel",
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
    cookie: {
      maxAge: 1000 * 60 * 60, // 쿠키 유효기간 1시간
    },
  })
);

app.get("/", function (req, res) {
  res.render("login");
});

app.post("/", function (req, res) {
  const empNo = req.body.empNo;
  const passwd = req.body.passwd;
  const authCode = req.body.authCode;

  connection.query(
    "select empNo, passwd, empName, authCode from emp where empNo=? and passwd=? and authCode=?",
    [empNo, passwd, authCode],
    function (err, rows) {
      //console.log(rows);
      if (rows.length) {
        if (
          rows[0].empNo == empNo &&
          rows[0].passwd == passwd &&
          rows[0].authCode == authCode
        ) {
          if (rows.length) {
            if (rows[0].authCode == "100") {
              console.log("최고관리자", rows[0].empNo);
              req.session.empNo = rows[0].empNo;
              req.session.passwd = rows[0].passwd;
              req.session.empName = rows[0].empName;
              req.session.authCode = rows[0].authCode;
              req.session.isLogined = true;
              req.session.save();
              res.render("superMain", {
                isLogined: true,
                empName: req.session.empName,
                empNo: req.session.empNo,
              });
            } else if (rows[0].authCode == "010") {
              console.log("듀티관리자", rows[0].empNo);
              req.session.empNo = rows[0].empNo;
              req.session.passwd = rows[0].passwd;
              req.session.empName = rows[0].empName;
              req.session.authCode = rows[0].authCode;
              req.session.isLogined = true;
              req.session.save();
              res.render("dutyMain", {
                isLogined: true,
                empName: req.session.empName,
                empNo: req.session.empNo,
              });
            } else {
              console.log("일반사용자", rows[0].empNo);
              req.session.empNo = rows[0].empNo;
              req.session.passwd = rows[0].passwd;
              req.session.empName = rows[0].empName;
              req.session.authCode = rows[0].authCode;
              req.session.isLogined = true;
              req.session.save();
              res.render("normalMain", {
                isLogined: true,
                empName: req.session.empName,
                empNo: req.session.empNo,
              });
            }
            console.log("로그인 성공!");
          }
        }
      } else {
        res.send(
          "<script>alert('사용자 정보가 일치하지 않습니다');location.href='/';</script>"
        );
        console.log("로그인 실패");
      }
    }
  );

  //
});

//로그아웃
app.get("/logout", function (req, res) {
  if (req.session.empNo) {
    // res.render('logout');
    req.session.destroy(); // 세션 삭제
    res.clearCookie("hnduty");
    res.clearCookie("connect.sid"); // 세션 쿠키 삭제
    console.log("세션&쿠키 삭제하고 로그아웃");
    res.send(
      "<script>alert('로그아웃 되었습니다.');location.href='/';</script>"
    );
  } else {
    console.log("로그인 상태 아님");
  }
});

// 세션값때문에 원티드 여기서

app.post("/wanted", function (req, res) {
  const empDate = String(req.body.date);
  const empShift = req.body.shiftCode;
  const empNo = String(req.session.empNo);
  const teamNo = req.session.teamNo;
  const deptNo = req.session.deptNo;
  const statRule = String(req.session.statRule);

  if (statRule == "00100" || statRule == "10100") {
    console.log(statRule, empNo, "상근");
    connection.query(
      "update currentdutytest set shiftCode='" +
        empShift +
        "' where empNo='" +
        empNo +
        "' and date='" +
        empDate +
        "'"
    );
    if (empShift == "ca" || empShift == "mo" || empShift == "yo") {
      connection.query(
        "insert into wanted (month,date,cautionCode,empNo) values ('" +
          nextMonth +
          "', '" +
          empDate +
          "', '" +
          empShift +
          "', '" +
          empNo +
          "')"
      );
    }
  } else {
    console.log(statRule, "비상근");
    connection.query(
      "insert into currentdutytest (month,date,teamNo,deptNo,empNo,shiftCode) values ('" +
        nextMonth +
        "'," +
        "'" +
        empDate +
        "'," +
        teamNo +
        "," +
        deptNo +
        "," +
        empNo +
        "," +
        "'" +
        empShift +
        "')"
    );
    if (
      empShift == "ca" ||
      empShift == "mo" ||
      empShift == "yo" ||
      empShift == "ho"
    ) {
      connection.query(
        "insert into wanted (month,date,cautionCode,empNo) values ('" +
          nextMonth +
          "', '" +
          empDate +
          "', '" +
          empShift +
          "', '" +
          empNo +
          "')"
      );
    }
  }
  res.send("배치완료");
});
module.exports = app;
