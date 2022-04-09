const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { connection } = require("../config/dao.js");

/**
 * 파일 명 : shiftTableElement.js
 * @author : 주민지
 * @date : 2022-04-08
 * @description : shiftTable배치를 위한 요소들이다.
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/orderDuty", function (req, res) {
  var empNwork =
    "SELECT * FROM hospital.currentduty order by month, date, empNo;";
  connection.query(empNwork, function (err, result) {
    if (err) {
      console.log("실패");
    } else {
      console.log("N근무를 모두 정렬해서 가져왔습니다.");
      res.json(result);
    }
  });
});

app.get('/api/distinct',function(req, res){
    var empNwork = 'select distinct empNo from hospital.currentduty;'
    connection.query(empNwork, function (err, result) {
        for (var i =0; i<result.length; i++){    
            //console.log(result[i].empNo);
        }
        res.json(result);
    });
});

module.exports = app;
