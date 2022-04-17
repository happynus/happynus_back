const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const { connection, getConnection } = require("../config/dao.js");

/**
 * 파일 명 : shiftTable.js
 * @author : 주민지
 * @date : 2022-04-12
 * @description : shiftTable배치.
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/shiftTableCk", function (req, res) {
  getConnection((conn) => {
    var empNwork = "select currentduty.empNo, currentduty.month, currentduty.date, currentduty.teamNo, currentduty.deptNo, currentduty.shiftCode, emp.position, emp.empname from currentduty, emp where emp.empno=currentduty.empno order by teamNo, empNo;";
    conn.query(empNwork, function (err, result) {
      console.log("시프트테이블체크",req.session.teamNo)
      if (err) {
        console.log("실패");
      } else {
        const empList = new Array();
        for (var i = 0; i < result.length; i++) {
          empList.push({
            teamName: result[i].teamName,
            position: result[i].position,
            empNo: result[i].empNo,
            empName: result[i].empname,
          });
        }
        function removeDuplicates(data, key) {
          return [
            ...new Map(data.map(item => [key(item), item])).values()
          ]
        };
        var removeDup = removeDuplicates(empList, item => item.empNo) 
        //console.log(removeDup);

        var empTotal = [];
        for (var j = 0; j < removeDup.length; j++) {
          const duty = [
            ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
            ' ', ' ', ' ', ' ', ' ', ' ',
          ];
          //console.log(removeDup[j].empNo)
          for (var shift = 0; shift < result.length; shift++) {
            if (
              result[shift].month == "05" &&
              removeDup[j].empNo == result[shift].empNo
            ) {
              duty.splice(
                parseInt(result[shift].date) - 1,
                1,
                result[shift].shiftCode
              );
            }
          }
          let shiftN = {
            teamName: removeDup[j].teamName,
            position: removeDup[j].position,
            empNo: removeDup[j].empNo,
            empName: removeDup[j].empName,
            duty: duty,
          };
          //console.log(duty);
          empTotal.push(shiftN);
        }
        //console.log(empTotal);
        //res.render("shiftTableCk", { emplist: empTotal });
        res.send(empTotal);
      }
    });
    conn.release();
    //console.log("conn 마감");
  });
});

module.exports = app;