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

// 사번, 부서, 팀, 특이사항, 권한별 출력
app.get("/api/emp/empno", function (req, res) {
  var deptno = req.query.deptno;
  console.log(deptno);
  connection.query(
    "select nurse.empno, nurse.name, dept.dept, \
	team.team, nurse.position from nurse, dept, \
	team where nurse.deptno=dept.deptno and nurse.teamno=team.teamno and (nurse.deptno=?)",
    deptno,
    function (err, results, fields) {
      if (err) throw err;
      else console.log("select " + results.length + " rows.");
      for (i = 0; i < results.length; i++) {
        console.log(JSON.stringify(results[i]));
      }
      res.json(results);
      console.log("*** DONE ***");
    }
  );
});

//팀별 출력
app.get("/api/emp/team", function (req, res) {
  var teamno = req.query.teamno;
  //	console.log(deptno, teamno)
  connection.query(
    "select nurse.empno, nurse.name, dept.dept, team.team, nurse.position from nurse, dept, team where nurse.deptno=dept.deptno and nurse.teamno=team.teamno and (nurse.teamno=?)",
    teamno,
    function (err, results, fields) {
      console.log(teamno);
      if (err) throw err;
      else console.log("select " + results.length + " rows.");
      for (i = 0; i < results.length; i++) {
        console.log(JSON.stringify(results[i]));
      }
      res.json(results);
      console.log("done.");
    }
  );
});

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
