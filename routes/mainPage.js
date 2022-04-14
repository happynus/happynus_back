const http = require("http");
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();
var fs = require("fs");
var mysql = require("mysql");
const request = require("request");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var MySQLStore = require("express-mysql-session")(session);
const path = require("path");
const { connection } = require("../config/dao.js");
const { cookie } = require("express/lib/response");
const { send } = require("process");

/**
 * 파일 명 : superMain.js
 * @author : 문승연
 * @date : 2022-04-07
 * @description : 최고관리자용 메인페이지
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

//동일시프트 근무자 출력 위한 함수
  var todayDate = today.getDate()
  
  function getCoworker (empNo, callback){
    var todayEmp = [];
    var myCoworkers = "select empNo from currentduty where date="+ todayDate +" and shiftCode in (select shiftCode from currentduty where empno=?)"

    connection.query(myCoworkers, empNo, function(err,result){
      for (var data of result){
        todayEmp.push(data.empNo)
      }
      return callback(todayEmp);
    })
  }



////////////////////////////////////////////////////

app.get("/superMain", function (req, res) {
  res.send("슈퍼관리자");
});

app.get("/normalMain", function (req, res) {
  res.send("일반")
});

app.get("/normalMainDutyCheck", function (req, res) {
  res.render("normalMainDutyCheck", {
    isLogined: true,
    empNo: req.session.empNo,
    empName: req.session.empName,
    authCode: req.session.authCode,
    empNo: req.session.empNo,
  });
});

app.get("/myDuty", function (req, res) {
  res.render("myDuty", {
    isLogined: true,
    empNo: req.session.empNo,
    empName: req.session.empName,
    authCode: req.session.authCode,
    empNo: req.session.empNo,
  });
});


app.get("/teamDutyAdmin", function (req, res) {
  res.render("teamDutyAdmin", {
    isLogined: true,
    empNo: req.session.empNo,
    empName: req.session.empName,
    authCode: req.session.authCode,
    empNo: req.session.empNo,
  });
});

app.get("/teamDutyCheck", function (req, res) {
  res.render("teamDutyCheck", {
    isLogined: true,
    empNo: req.session.empNo,
    empName: req.session.empName,
    authCode: req.session.authCode,
    empNo: req.session.empNo,
  });
});

// app.get('/superMain',function(req,res){
//   console.log("메인",req.session.empNo)
//   //res.send("슈퍼관리자")
//     res.render('superMain',{
//       isLogined: true,
//       empName: req.session.empName,
//       authCode: req.session.authCode,
//       empNo: req.session.empNo
//     });
// })



//당일 오프자 출력
app.get("/api/emp/offemp", function (req, res){
	var todayOff = "select currentduty.empNo, emp.empName from currentduty, emp where currentduty.date= ? and currentduty.shiftCode='/' and emp.empNo=currentduty.empNo";
	var myDate = today.getDate();
  var offempList = [];
  
	connection.query(todayOff, myDate, function(err, result){
	  for (var data of result){
		offempList.push(data)
	  }
   // console.log(offempList)
    return offempList;
	});
  });



  app.post("/api/emp/coworkers", function(req,res){
    var testEmp= req.body.empNo;

    getCoworker(testEmp, function(todayEmp){
      for (i=0; i<todayEmp.length; i++){
        connection.query("select currentduty.empNo, emp.empName from currentduty, emp where currentduty.date="+todayDate+
        " and currentduty.empNo=" + todayEmp[i] + " and currentduty.shiftCode!='/' and currentduty.empNo!="+testEmp+
        " and emp.empNo=currentduty.empNo", function(err, result){
          for (var data of result){
            console.log("데이터",data)
            return data
          }
        })
      }
    })
  })



module.exports = app;
