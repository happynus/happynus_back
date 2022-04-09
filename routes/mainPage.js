const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var fs = require('fs');
var mysql = require('mysql');
var cookieParser = require('cookie-parser');
var session=require('express-session');
var FileStore = require('session-file-store')(session);
//const path = require('path');
const {connection} = require("../config/dao.js");
const { cookie } = require("express/lib/response");

  /**
 * 파일 명 : superMain.js
 * @author : 문승연
 * @date : 2022-04-07
 * @description : 최고관리자용 메인페이지
*/


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.json());
app.use(express.urlencoded({extended : true}));

app.get('/superMain',function(req,res){
    res.render('superMain');
})

app.get('/dutyMain',function(req,res){
  res.render('dutyMain');
})

app.get('/normalMain',function(req,res){
  res.render('normalMain');
})



module.exports = app;