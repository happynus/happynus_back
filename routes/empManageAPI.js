const express = require("express");
const app = express();
const bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");

const {
  connection,
  empLookUp,
  insertEmpData,
  modifyEmp,
  deletEmp
} = require("../config/dao.js");

/**
 * 파일 명 : empManageAPI.js
 * @author : 주민지
 * @date : 2022-03-21
 * @description : 근무자 CRUD API 제작 완료
 */

//DB접속
// const connection = new mysql.createConnection(DbConnect);
// connection.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 전체 근무자 출력v
app.get("/api/emp", function (req, res) {
  empLookUp("hospital.emp", res);
});

// 전체 근무자 출력 팀이름 등만 출력하도록 함
app.get('/api/emp/total', function(req,res){
  var getWholeEmp = "select emp.empNo, emp.empName, dept.deptName, team.teamName, emp.position,date_format(emp.empEntry,'%Y/%m/%d'),emp.phoneNum from emp,dept,team where emp.deptNo=dept.deptNo and emp.teamNo=team.teamNo"
 connection.query(getWholeEmp, function(err, results, fields){
    if(err) throw err;
    else console.log('select ' + results.length + ' rows.');
    for (i=0; i < results.length; i++){
       //console.log(JSON.stringify(results[i]));
    }
    res.json(results);
 })
});

//팀별 출력
app.post("/api/emp/team", function(req, res){
 var teamNo = req.body.teamNo;

  var getByTeam = "select emp.empNo, emp.empName, dept.deptName, team.teamName, emp.position,emp.empEntry,emp.phoneNum from emp,dept,team where emp.deptNo=dept.deptNo and emp.teamNo=team.teamNo and (emp.teamNo=?)"
 connection.query(getByTeam, teamNo, function(err, results, fields){
    if(err) throw err;
    else console.log('select ' +results.length + ' rows.');
    for (i=0; i<results.length; i++){
       //console.log(JSON.stringify(results[i]));
    }
    res.json(results);
 })
})

//신규근무자 추가v
app.post("/api/emp/add", (req, res) => {
  var empNo = req.body.empNo;
  var passwd = req.body.passwd;
  var empName = req.body.empName;
  var sex = req.body.sex;
  var phoneNum = req.body.phoneNum;
  var empEntry = req.body.empEntry;
  var deptNo = req.body.deptNo;
  var teamNo = req.body.teamNo;
  var position = req.body.position;
  var levelCode = req.body.levelCode;
  var statRule = req.body.statRule;
  var preceptor = req.body.preceptor;
  var authCode = req.body.authCode;

  var sqlInsert = {
    empNo:empNo,
    passwd:passwd,
    empName:empName,
    sex:sex,
    phoneNum:phoneNum,
    empEntry:empEntry,
    deptNo:deptNo,
    teamNo:teamNo,
    position:position,
    levelCode:levelCode,
    statRule:statRule,
    preceptor:preceptor,
    authCode:authCode,
  };
  insertEmpData(empNo, "hospital.emp", sqlInsert, res)
});

//기존 근무자 정보 수정v
app.post("/api/emp/update", function (req, res) {
  var empNo = req.body.empNo;
  var passwd = req.body.passwd;
  var empName = req.body.empName;
  var sex = req.body.sex;
  var phoneNum = req.body.phoneNum;
  var empEntry = req.body.empEntry;
  var deptNo = req.body.deptNo;
  var teamNo = req.body.teamNo;
  var position = req.body.position;
  var levelCode = req.body.levelCode;
  var statRule = req.body.statRule;
  var preceptor = req.body.preceptor;
  var authCode = req.body.authCode;

  var sqlInsert = {
    empNo:empNo,
    passwd:passwd,
    empName:empName,
    sex:sex,
    phoneNum:phoneNum,
    empEntry:empEntry,
    deptNo:deptNo,
    teamNo:teamNo,
    position:position,
    levelCode:levelCode,
    statRule:statRule,
    preceptor:preceptor,
    authCode:authCode,
  };

  modifyEmp("empNo", "hospital.emp", sqlInsert, empNo, res);
});

//근무자 삭제v
app.post("/api/emp/delete", (req, res) => {
  var empNo = req.body.empNo;
  deletEmp("empNo", "hospital.emp", empNo, res);
});

module.exports = app;
