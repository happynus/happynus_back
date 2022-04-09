const express = require("express");
const app = express();
var fs = require("fs");
var mysql = require("mysql");
//const {app} = require("../routes/restful.js");

/**
 * 파일 명 : dao.js
 * @author : 주민지
 * @date : 2022-03-21
 * @description : DAO 모듈, 0319 : 재사용성 있게 수정
 */

//db접속
var connection = mysql.createConnection({
  host: "mysql-hnduty.mysql.database.azure.com",
  user: "hnadmin",
  password: "hn!753159",
  database: "hospital",
  port: 3306,
});

//selectFields : 내가 선택하려는 세로줄
//queryParameters : 쿼리에 따라 변하는 수

var dbconn = function (queryString, InsertData, processResult) {
  connection.query(queryString, InsertData, function (error, results) {
    if (error) {
      throw error;
    } else {
      processResult.json(results);
    }
  });
};

var dbconn2 = function (
  queryString1,
  queryString2,
  queryParameters1,
  queryParameters12,
  processResult
) {
  connection.query(queryString1, queryParameters1, function (err, results) {
    if (results.length) {
      processResult.json({ result: "fail" });
    } else {
      dbconn(queryString2, queryParameters12, processResult);
    }
  });
};

var dbconn3 = function (queryString1, processResult) {
  let today = new Date();

  year = today.getFullYear(); //올해년도

  connection.query(queryString1, function (err, result) {
    for (var i = 0; i < result.length; i++) {
      var nisHere =
        "select exists (select shiftCode from hospital.currentduty where month=" +
        result[i].month +
        " && date=" +
        String(parseInt(result[i].date) + 1).padStart(2, "0") +
        " && empNo=" +
        result[i].empNo +
        ")" +
        '"' +
        result[i].month +
        '"' +
        '"' +
        String(parseInt(result[i].date) + 1).padStart(2, "0") +
        '"' +
        '"' +
        result[i].teamNo +
        '"' +
        '"' +
        result[i].deptNo +
        '"' +
        '"' +
        result[i].empNo +
        '";';
      connection.query(nisHere, function (err, result2) {
        if (Object.values(result2[0]) == 0) {
          var str = Object.keys(result2[0]);
          var month = str.toString().charAt(0) + str.toString().charAt(1);
          var date = str.toString().charAt(3) + str.toString().charAt(4);
          var teamNo =
            str.toString().charAt(6) +
            str.toString().charAt(7) +
            str.toString().charAt(8) +
            str.toString().charAt(9);
          var deptNo =
            str.toString().charAt(11) +
            str.toString().charAt(12) +
            str.toString().charAt(13);
          var empNo =
            str.toString().charAt(15) +
            str.toString().charAt(16) +
            str.toString().charAt(17) +
            str.toString().charAt(18) +
            str.toString().charAt(19) +
            str.toString().charAt(20);
          switch (month) {
            case "01":
            case "03":
            case "05":
            case "07":
            case "08":
            case "10":
              if (date == "32") {
                var nightAndOff =
                  'INSERT INTO hospital.currentduty (month, date, teamNo, deptNo, empNo, shiftCode) VALUES ("' +
                  String(parseInt(month) + 1).padStart(2, "0") +
                  '", "01", "' +
                  teamNo +
                  '", "' +
                  deptNo +
                  '", "' +
                  empNo +
                  '", "/");';
              } else {
                var nightAndOff =
                  'INSERT INTO hospital.currentduty (month, date, teamNo, deptNo, empNo, shiftCode) VALUES ("' +
                  month +
                  '", "' +
                  date +
                  '", "' +
                  teamNo +
                  '", "' +
                  deptNo +
                  '", "' +
                  empNo +
                  '", "/");';
              }
              break;
            case "04":
            case "06":
            case "09":
            case "11":
              if (date == "31") {
                var nightAndOff =
                  'INSERT INTO hospital.currentduty (month, date, teamNo, deptNo, empNo, shiftCode) VALUES ("' +
                  String(parseInt(month) + 1).padStart(2, "0") +
                  '", "01", "' +
                  teamNo +
                  '", "' +
                  deptNo +
                  '", "' +
                  empNo +
                  '", "/");';
              } else {
                var nightAndOff =
                  'INSERT INTO hospital.currentduty (month, date, teamNo, deptNo, empNo, shiftCode) VALUES ("' +
                  month +
                  '", "' +
                  date +
                  '", "' +
                  teamNo +
                  '", "' +
                  deptNo +
                  '", "' +
                  empNo +
                  '", "/");';
              }
              break;
            case "02":
              if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
                if (date == "30") {
                  var nightAndOff =
                    'INSERT INTO hospital.currentduty (month, date, teamNo, deptNo, empNo, shiftCode) VALUES ("' +
                    String(parseInt(month) + 1).padStart(2, "0") +
                    '", "01", "' +
                    teamNo +
                    '", "' +
                    deptNo +
                    '", "' +
                    empNo +
                    '", "/");';
                }
              } else if (date == "29") {
                var nightAndOff =
                  'INSERT INTO hospital.currentduty (month, date, teamNo, deptNo, empNo, shiftCode) VALUES ("' +
                  String(parseInt(month) + 1).padStart(2, "0") +
                  '", "01", "' +
                  teamNo +
                  '", "' +
                  deptNo +
                  '", "' +
                  empNo +
                  '", "/");';
              } else {
                var nightAndOff =
                  'INSERT INTO hospital.currentduty (month, date, teamNo, deptNo, empNo, shiftCode) VALUES ("' +
                  month +
                  '", "' +
                  date +
                  '", "' +
                  teamNo +
                  '", "' +
                  deptNo +
                  '", "' +
                  empNo +
                  '", "/");';
              }
              break;
            case "12":
              if (date == "32") {
                var nightAndOff =
                  'INSERT INTO hospital.currentduty (month, date, teamNo, deptNo, empNo, shiftCode) VALUES ("01", "01", "' +
                  teamNo +
                  '", "' +
                  deptNo +
                  '", "' +
                  empNo +
                  '", "/");';
              } else {
                var nightAndOff =
                  'INSERT INTO hospital.currentduty (month, date, teamNo, deptNo, empNo, shiftCode) VALUES ("' +
                  month +
                  '", "' +
                  date +
                  '", "' +
                  teamNo +
                  '", "' +
                  deptNo +
                  '", "' +
                  empNo +
                  '", "/");';
              }
              break;
          }
          //console.log(nightAndOff);
          connection.query(nightAndOff, function (err, result3) {
            console.log("data Insert");
            //processResult.json(result3);
          });
        }
      });
    }
  });
};

module.exports = {
  connection,

  empLookUp: function (tableName, processResult) {
    var empList = "SELECT * FROM " + tableName;
    dbconn(empList, null, processResult);
  },

  insertEmpData: function (
    selectFields,
    tableName,
    queryParameters,
    processResult
  ) {
    var selectEmpNo =
      "select empNo from " + tableName + " where empNo=" + selectFields;
    var empInsert = "insert into " + tableName + " set ?";
    dbconn2(
      selectEmpNo,
      empInsert,
      selectFields,
      queryParameters,
      processResult
    );
  },

  modifyEmp: function (
    selectFields,
    tableName,
    queryParameters1,
    queryParameters2,
    processResult
  ) {
    var modiEmpInfo =
      "update " +
      tableName +
      " set ?" +
      " where " +
      selectFields +
      "=" +
      queryParameters2;
    dbconn(
      modiEmpInfo,
      [queryParameters1, selectFields, queryParameters2],
      processResult
    );
  },

  deletEmp: function (selectFields, tableName, queryParameters, processResult) {
    var delEmp =
      "delete from " +
      tableName +
      " where " +
      selectFields +
      "=" +
      queryParameters;
    dbconn(delEmp, queryParameters, processResult);
  },
  //Rule
  nightWorkCnt: function () {},

  nightAfterOff: function (
    selectFields1,
    selectFields2,
    tableName,
    queryParameters1,
    processResult
  ) {
    var empNwork =
      'select * from hospital.currentduty where empNo && shiftCode="N";';
    dbconn3(empNwork);
  },
};
