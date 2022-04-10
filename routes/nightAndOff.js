const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var mysql = require("mysql");
const path = require("path");
const { connection } = require("../config/dao.js");

/**
 * 파일 명 : nightAndOff.js
 * @author : 주민지
 * @date : 2022-03-25
 * @description : 나이트 룰 - Night 근무 후에는 Off가 있어야 한다. 0325-여러명의 사용자 정보를 입력받을 수 있도록 변경
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let today = new Date();

year = today.getFullYear(); //올해년도

var empNwork =
  'select * from hospital.currentduty where empNo && shiftCode="N";';
connection.query(empNwork, function (err, result) {
  var nShift = [];
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
    //nShift.push(nisHere);
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
        //nShift.push(nightAndOff);
        connection.query(nightAndOff, function (err, result3) {
          //console.log(`${result3.length}`+"개의 OF 배치 완료");
          //console.log(result3);
          //nShift.push(result3);
        });
      }
      //console.log(nShift);
    });
  }
  app.get("/nightTurn", function (req, res) {
    res.send("배치완료");
  });
});

module.exports = app;
