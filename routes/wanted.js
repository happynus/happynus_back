const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var fs = require('fs');
var mysql = require('mysql');
var cookieParser = require('cookie-parser');
const router = express.Router();
var session=require('express-session');
var mongoose = require('mongoose');
var FileStore = require('session-file-store')(session);
const path = require('path');
const {connection} = require("../config/dao.js");
const { cookie } = require("express/lib/response");


  /**
 * 파일 명 : login.js
 * @author : 문승연
 * @date : 2022-04-05
 * @description : 로그인/아웃 구현
*/

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cookieParser());

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(session({
  key: 'hnduty',
  secret: 'nextlevel',
  resave:false,
  saveUninitialized:false,
  store: new FileStore(), 
 cookie: {
    maxAge: 1000 * 60 * 60 // 쿠키 유효기간 1시간
  }
}));



//날짜 정의
let today = new Date();

year = today.getFullYear(); //올해년도
nextMonth = String(today.getMonth() + 2).padStart(2, "0");//작성일 기준 다음달
firstDate = new Date(year,parseInt(nextMonth),1).getDate(); //해당월 첫 날
lastDate = new Date(year,parseInt(nextMonth)+1,0).getDate(); //해당월 마지막날
if((year%4===0 && year % 100 !==0) || year%400===0) { //윤년 적용
    lastDate[1]=29;
}


//한달 전체 리스트 출력
function wholeDates(startDate,endDate){
    var totalDate = [];
    let i=startDate;

    while(true){
        totalDate.push(i);
        if( i == endDate){
            break;
        }
        i++;
    } 
    return totalDate;
}


//배정된 나이트 날짜 가져오기
var assignedDates = []
function savedDates(empNo,callback){
    connection.query("select date from currentduty where empNo="+empNo, function(err, result){
        for (var data of result){
            assignedDates.push(data.date)
        }
       return callback(assignedDates);            
    })
}

//(배정된 날짜 제외) 원티드 신청 일자 출력
function availableDate(empNo,callback){
    var thisMonthDates=wholeDates(firstDate,lastDate)

    savedDates(empNo, function(assignedDates){
        for (i=0; i<assignedDates.length; i++){
            thisMonthDates = thisMonthDates.filter(function(item){
                return item != assignedDates[i];
            });
        };
       return callback(thisMonthDates);
        });
};




    app.post('/wanted', function(req,res){

    const empDate= String(req.body.date);
    const empShift = req.body.shiftCode
    const empNo = String(req.session.empNo);
    const teamNo = req.session.teamNo;
    const deptNo = req.session.deptNo;
    const statRule = String(req.session.statRule);

if (statRule == '00100' || statRule == '10100'){
    connection.query("update currentduty set shiftCode='"+empShift+"' where empNo='"+empNo+"' and date='"+empDate+"'")
    if (empShift=='ca' || empShift=='mo' || empShift=='yo'){
        connection.query("insert into wanted (month,date,cautionCode,empNo) values ('"+nextMonth+"', '"+empDate+"', '"+empShift+"', '"+empNo+"')")
    }
} else{
   connection.query("insert into currentduty (month,date,teamNo,deptNo,empNo,shiftCode) values ('" +nextMonth+ "'," +"'"+empDate+"',"+ teamNo+","+deptNo+","+empNo+","+"'"+empShift+"')")
   if (empShift=='ca' || empShift=='mo' || empShift=='yo' || empShift=='ho'){
    connection.query("insert into wanted (month,date,cautionCode,empNo) values ('"+nextMonth+"', '"+empDate+"', '"+empShift+"', '"+empNo+"')")
}
}
res.send("<script>alert('원티드 신청이 완료되었습니다!');location.href='http://localhost:3000/wanted';</script>");
});


module.exports = app;