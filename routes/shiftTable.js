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

app.get("/shiftTable", function (req, res) {
  getConnection((conn) => {
    //console.log("conn 시작");
    var empNwork =
      "select currentduty.empNo, currentduty.month, currentduty.date, team.teamName, currentduty.shiftCode, emp.position, emp.empName from currentduty, emp, team where emp.empno=currentduty.empno and team.teamNo=currentduty.teamNo order by team.teamNo, currentduty.empNo;";
    conn.query(empNwork, function (err, result) {
      console.log(empNwork);
      console.log(result);
      if (err) {
        console.log("실패");
      } else {
        const empList = new Array();
        for (var i = 0; i < result.length; i++) {
          empList.push({
            teamNo: result[i].teamNo,
            teamName: result[i].teamName,
            position: result[i].position,
            empNo: result[i].empNo,
            empName: result[i].empName,
          });
        }
        //console.log(empNo);
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
            teamNo: removeDup[j].teamNo,
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
        //res.render("shiftTable", { emplist: empTotal });
        res.send(empTotal);
      }
    });
    conn.release();
    //console.log("conn 마감");
  });
});

module.exports = app;