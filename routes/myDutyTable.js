const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var cookieParser = require("cookie-parser");
var session = require("express-session");
var FileStore = require("session-file-store")(session);
const { connection, getConnection } = require("../config/dao.js");

/**
 * 파일 명 : myDutyTable.js
 * @author : 주민지
 * @date : 2022-04-15
 * @description : 개인근무만 띄워줌.
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(
  session({
    key: "hnduty",
    secret: "nextlevel",
    resave: false,
    saveUninitialized: false,
    store: new FileStore(),
    cookie: {
      maxAge: 1000 * 60 * 60, // 쿠키 유효기간 1시간
    },
  })
);

app.get("/myDutyTable", function (req, res) {
  getConnection((conn) => {
    //console.log("conn 시작");
    var empNwork =
      "select currentduty.empNo, currentduty.month, currentduty.date, team.teamName, currentduty.deptNo, currentduty.shiftCode, emp.position, emp.empname from currentduty, emp, team where emp.empno=currentduty.empno and currentduty.empno='225115' and team.teamName='간호2팀';";
    //var empNwork = "select * from hospital.currentduty where empNo = 225115;"
    conn.query(empNwork, function (err, result) {
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
        //console.log(empNo);
        function removeDuplicates(data, key) {
          return [...new Map(data.map((item) => [key(item), item])).values()];
        }
        var removeDup = removeDuplicates(empList, (item) => item.empNo);
        //console.log(removeDup);

        var empTotal = [];
        for (var j = 0; j < removeDup.length; j++) {
          const duty = [
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
            " ",
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
        //res.render("myDutyTable", { emplist: empTotal });
        res.send(empTotal);
      }
    });
    conn.release();
    //console.log("conn 마감");
  });
});

module.exports = app;
