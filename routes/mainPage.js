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
var FileStore = require("session-file-store")(session);
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

var todayEmp = [];
  var todayDate = today.getDate()
  function getCoworker (empNo, callback){

  var myCoworkers = "select empNo from currentduty where date="+ todayDate +" and shiftCode in (select shiftCode from currentduty where empno='" +empNo + "' and date=" +todayDate+")"

    connection.query(myCoworkers, function(err,result){
      for (var data of result){
        todayEmp.push(data.empNo)
      }
      return callback(todayEmp);
    })
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

  // getCoworker(205986, function(todayEmp){
  //   console.log("여기",todayEmp)
  // })



////////////////////////////////////////////////////

// app.get("/normalMainDutyCheck", function (req, res) {
//   res.render("normalMainDutyCheck", {
//     isLogined: true,
//     empNo: req.session.empNo,
//     empName: req.session.empName,
//     authCode: req.session.authCode,
//     empNo: req.session.empNo,
//   });
// });

app.get("/myDuty", function (req, res) {
  res.render("myDuty", {
    isLogined: true,
    empNo: req.session.empNo,
    empName: req.session.empName,
    authCode: req.session.authCode,
    empNo: req.session.empNo,
  });
});



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


  app.post("/api/emp/mydutyToday", function(req,res){
    var userEmp = req.body.empNo;
    var myDate = today.getDate();
    var getMyduty = "select shiftCode from currentduty where empNo='"+userEmp+"' and date='"+myDate+"'"

    connection.query(getMyduty, function(err, result){
      console.log(result)
      return result;
    })
  })


  app.get("/api/emp/coworkers", function(req,res){
    const userEmp = req.session.empNo;
    var coworkerList = []
    var myDate = today.getDate();
    console.log(userEmp, "사번")

    getCoworker(userEmp , function(todayEmp){
      for (i=0; i<todayEmp.length; i++){
        connection.query("select currentduty.empNo, emp.empName from currentduty, emp where currentduty.date="+myDate+
        " and currentduty.empNo=" + todayEmp[i] + " and currentduty.shiftCode!='/' and currentduty.empNo!="+userEmp +
        " and emp.empNo=currentduty.empNo", function(err, result){

          for (var data of result){
            console.log(data.empNo, data.empName)
            //coworkerList.push(data.empNo, data.empName)
            return coworkerList;
          }
        })
      }
    })
  })



module.exports = app;
