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
  }
};
