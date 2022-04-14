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

app.get("/superMain", function (req, res) {
  res.send("슈퍼관리자");
});

app.get("/dutyMain", function (req, res) {
  res.render("dutyMain", {
    isLogined: true,
    empName: req.session.empName,
    authCode: req.session.authCode,
    empNo: req.session.empNo,
  });
});

app.get("/normalMain", function (req, res) {
  res.render("normalMain", {
    isLogined: true,
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

// app.get ('/normalMain', function(req,res){
//   res.send("슈퍼관리자")
// })
// app.get('/normalMain',function(req,res){
//   res.send("일반사용자 메인")

// })

// var loginInfo = {
//  isLogined: req.session.isLogined,
//   empName: req.session.empName,
//   empNo: req.session.empNo
// }

module.exports = app;
