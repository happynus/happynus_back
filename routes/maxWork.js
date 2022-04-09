const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var mysql = require("mysql");
const path = require("path");
const { connection } = require("../config/dao.js");

/**
 * 파일 명 : maxWork.js
 * @author : 주민지
 * @date : 2022-03-21
 * @description : 나이트 룰 - 나이트 최대 근무는 12번
 */

//DB접속
const connection = new mysql.createConnection(DbConnect);
connection.connect(); //db접속

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

var nightWorkCnt =
  "SELECT COUNT(shiftCode) as cntNShift FROM hospital.currentduty where empNo=071001 && shiftCode='N';";
//var nightWorkCnt = 'SELECT COUNT('+ shiftCode +') FROM '+ hospital.currentduty +' where '+ empNo +'=';

connection.query(nightWorkCnt, function (err, result) {
  if (result[0].cntNShift >= 12) {
    console.log(result[0].cntNShift);
    console.log("더 이상 나이트 근무를 배치 할 수 없습니다.");
  } else if (result[0].cntNShift < 12) {
    //달이랑 일 보고 나이트 규칙에 맞게 나이트 배치 하게 해야함 그게 else if에 들어가야해
    console.log(result[0].cntNShift);
  }
});

module.exports = app;
