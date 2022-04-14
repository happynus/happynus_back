const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var fs = require("fs");
var mysql = require("mysql");
var cookieParser = require("cookie-parser");
const router = express.Router();
var session = require("express-session");
var mongoose = require("mongoose");
var FileStore = require("session-file-store")(session);
const path = require("path");
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
app.use(cookieParser());

// cookie-parser 설정
app.use(cookieParser());

//날짜 정의
let today = new Date();

year = today.getFullYear(); //올해년도
nextMonth = String(today.getMonth() + 2).padStart(2, "0"); //작성일 기준 다음달
firstDate = new Date(year, parseInt(nextMonth), 1).getDate(); //해당월 첫 날
lastDate = new Date(year, parseInt(nextMonth) + 1, 0).getDate(); //해당월 마지막날
if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
  //윤년 적용
  lastDate[1] = 29;
}

//한달 전체 리스트 출력
function wholeDates(startDate, endDate) {
  var totalDate = [];
  let i = startDate;

  while (true) {
    totalDate.push(i);
    if (i == endDate) {
      break;
    }
    i++;
  }
  return totalDate;
}

//배정된 나이트 날짜 가져오기
var assignedDates = [];
function savedDates(empNo, callback) {
  connection.query(
    "select date from currentduty where empNo=" + empNo,
    function (err, result) {
      for (var data of result) {
        assignedDates.push(data.date);
      }
      return callback(assignedDates);
    }
  );
}

//(배정된 날짜 제외) 원티드 신청 일자 출력
function availableDate(empNo, callback) {
  var thisMonthDates = wholeDates(firstDate, lastDate);

  savedDates(empNo, function (assignedDates) {
    for (i = 0; i < assignedDates.length; i++) {
      thisMonthDates = thisMonthDates.filter(function (item) {
        return item != assignedDates[i];
      });
    }
    return callback(thisMonthDates);
  });
}


app.post("/", function (req, res) {
  const empNo = req.body.empNo;
  const passwd = req.body.passwd;
  const authCode = req.body.authCode;

  connection.query(
    "select empNo, passwd, empName, authCode, deptNo, teamNo, statRule from emp where empNo=? and passwd=? and authCode=?",
    [empNo, passwd, authCode],
    function (err, rows) {
      if (rows.length) {
        if (
          rows[0].empNo == empNo &&
          rows[0].passwd == passwd &&
          rows[0].authCode == authCode
        ) {
          if (rows.length) {
            if (rows[0].authCode == "100") {
              req.session.empNo = rows[0].empNo;
              req.session.passwd = rows[0].passwd;
              req.session.empName = rows[0].empName;
              req.session.authCode = rows[0].authCode;
              req.session.deptNo = rows[0].deptNo;
              req.session.teamNo = rows[0].teamNo;
              req.session.statRule = rows[0].statRule;
              req.session.isLogined = true;
              req.session.save();
              console.log(req.session);
              res.redirect("http://localhost:3000/superadm");
            } else if (rows[0].authCode == "010") {
              req.session.empNo = rows[0].empNo;
              req.session.passwd = rows[0].passwd;
              req.session.empName = rows[0].empName;
              req.session.authCode = rows[0].authCode;
              req.session.deptNo = rows[0].deptNo;
              req.session.teamNo = rows[0].teamNo;
              req.session.statRule = rows[0].statRule;
              req.session.isLogined = true;
              req.session.save();
              console.log(req.session);
              res.redirect("http://localhost:3000/dutyadm");
            } else {
              req.session.empNo = rows[0].empNo;
              req.session.passwd = rows[0].passwd;
              req.session.empName = rows[0].empName;
              req.session.authCode = rows[0].authCode;
              req.session.deptNo = rows[0].deptNo;
              req.session.teamNo = rows[0].teamNo;
              req.session.statRule = rows[0].statRule;
              req.session.isLogined = true;
              req.session.save(function () {
                res.redirect("http://localhost:3000/normal");
              });
              console.log(req.session);
            }
            console.log("로그인 성공!");
          }
        }
      } else {
        res.send(
          "<script>alert('사용자 정보가 일치하지 않습니다');location.href='http://localhost:3000/login';</script>"
        );
        console.log("로그인 실패");
      }
    }
  );
});

//로그아웃
app.get("/logout", function (req, res) {
  if (req.session.empNo) {
    console.log(req.session);
    req.session.destroy(); // 세션 삭제
  } else {
    console.log("로그인 상태 아님");
  }
});

module.exports = app;
