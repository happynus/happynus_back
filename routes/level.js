const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var fs = require("fs");
var mysql = require("mysql");
const path = require("path");
const { connection, getConnection } = require("../config/dao.js");

/**
 * 파일 명 : level.js
 * @author : 문승연
 * @date : 2022-03-21
 * @description : 숙련도 업데이트
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/emp/level", function (res, req) {
  getConnection((conn) => {
    conn.query(
        "select empNo, year(now())-year(empEntry) as workedYear, levelCode, position from emp",
        function (err, result) {
          for (var data of result) {
            //전문레벨
            if (8 < data.workedYear && data.levelCode == "1000") {
              console.log(data.empNo, data.levelCode, "=전문");
            } else if (8 < data.workedYear && data.levelCode != "1000") {
              // connection.query('update emp set levelCode="1000" where empNo=' + data.empNo)
              console.log(
                data.empNo,
                data.levelCode,
                "숙련도를 [전문]으로 업데이트했습니다."
              );
            }
            //책임레벨
            else if (
              4 <= data.workedYear &&
              data.workedYear < 8 &&
              data.levelCode == "0100"
            ) {
              console.log(data.empNo, data.levelCode, "=책임");
            } else if (
              4 <= data.workedYear &&
              data.workedYear < 8 &&
              data.levelCode != "0100"
            ) {
              connection.query(
                'update emp set levelCode="0100" where empNo=' + data.empNo
              );
              console.log(
                data.empNo,
                "번 근무자의 숙련도를 [책임]으로 업데이트했습니다."
              );
            }
            //일반레벨
            else if (
              1 <= data.workedYear &&
              data.workedYear < 4 &&
              data.levelCode == "0010"
            ) {
              console.log(data.empNo, data.levelCode, "=일반");
            } else if (
              1 <= data.workedYear &&
              data.workedYear < 4 &&
              data.levelCode != "0010"
            ) {
              connection.query(
                'update emp set levelCode="0010" where empNo=' + data.empNo
              );
              if (data.position != "일반간호사") {
                connection.query(
                  "update emp set position='일반간호사' where empNo=" + data.empNo
                );
              }
              console.log(
                data.empNo,
                "번 근무자의 숙련도를 [일반]으로 업데이트했습니다."
              );
            }
            //신규레벨
            else if (data.workedYear < 1 && data.levelCode == "0001") {
              console.log(data.empNo, data.levelCode, "=신규");
            } else if (data.workedYear < 1 && data.levelCode != "0001") {
              connection.query(
                'update emp set levelCode="0001" where empNo=' + data.empNo
              );
              console.log(
                data.empNo,
                "번 근무자의 숙련도를 [신규]로 업데이트했습니다."
              );
            }
            //예외
            else {
              console.log(
                data.empNo,
                data.position,
                data.levelCode,
                ": 데이터를 다시 확인하세요"
              );
            }
          }
        }
      );
      conn.release();
      console.log("conn 마감")
  });
});

module.exports = app;
