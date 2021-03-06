const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var mysql = require("mysql");
const { connection, nightAfterOff } = require("../config/dao.js");
var fs = require("fs");
var mysql = require("mysql");
const path = require("path");
const holidays = require("holidays-kr");
const { DEC8_BIN } = require("mysql/lib/protocol/constants/charsets");
holidays.serviceKey =
  "2DA93J%2BpAcN2rk%2FqZFXmjsIem1Jp7ujROUeQReR8ER5NyVp2Khuuk4CBvmhl9iCiBHsf1UXC18Haf%2FTEILDNlQ%3D%3D";

/**
 * 파일 명 : nightTurn.js
 * @author : 주민지 & 문승연
 * @date : 2022-04-02
 * @description : 나이트 근무 배치 룰 통합
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//날짜 정의
let today = new Date();

year = today.getFullYear(); //올해년도
nextMonth = String(today.getMonth() + 2).padStart(2, "0"); //작성일 기준 다음달
firstDate = new Date(year, parseInt(nextMonth), 1).getDate(); //해당월 첫 날
lastDate = new Date(year, parseInt(nextMonth) + 1, 0).getDate(); //해당월 마지막날
if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
  //윤년 적용
  lastDate[1] = 29;
}

//날짜 범위 안에서 랜덤한 숫자출력
function randomDate(min, max) {
  getDutyDates = Math.floor(Math.random() * (max - min + 1)) + min;
  return getDutyDates;
}
//중복체크 함수
function getDateArray(min, max, count) {
  if (max - min + 1 < count) return;

  var randomDateArray = [];

  while (1) {
    var index = randomDate(min, max);
    if (randomDateArray.indexOf(index) > -1) {
      continue;
    }
    randomDateArray.push(index);
    if (randomDateArray.length == count) {
      break;
    }
  }
  //return randomDateArray;
  return randomDateArray.sort(function (a, b) {
    return a - b;
  });
}

//상근자용 날짜 함수
//한달 전체 리스트 출력
function wholeDates(startDate, endDate) {
  var totalDate = [];
  let i = startDate;

  while (true) {
    totalDate.push(i);
    if (i == endDate) {
      break;
    }
    i++;
  }
  return totalDate;
}

//해당월 주말+공휴일 제외한 배정가능 날짜 출력
function mdWorkingDays(year, month, callback) {
  var thisMonthDates = wholeDates(firstDate, lastDate);
  var wkndList = [];

  for (i = 0; i < thisMonthDates.length; i++) {
    wknd = new Date(
      "'" + year + "-" + month + "-" + thisMonthDates[i] + "'"
    ).getDay();
    if (wknd != 0 && wknd != 6) {
      wkndList.push(thisMonthDates[i]);
    }
  }
  holidays
    .getHolidays({
      year: year,
      month: parseInt(month),
      monthCount: 1,
    })
    .then((list) => {
      for (var i = 0; i < list.length; i++) {
        var selectedHo = list[i][Object.keys(list[i])[3]];
        for (var j = 0; j < wkndList.length; j++) {
          if (wkndList[j] == selectedHo) {
            wkndList.splice(j, 1);
            j--;
          }
        }
      }
      return callback(wkndList);
    });
}

//N 근무에 들어가는 비율 계산
function empRateRound(count, rate) {
  empRate = Math.round(count.length * rate);
  return empRate;
}

//N근무에 레벨코드별로 인원 배치
function calculEmpNum(res_, count) {
  if (res_ == 0) {
    return 0;
  }

  var nightDates = getDateArray(firstDate, lastDate, lastDate);
  for (var j = 0; j < nightDates.length; j++) {
    for (var i = 0; i < res_; i++) {
      let randomIndexArray = [];
      for (i = 0; i < res_; i++) {
        randomNum = Math.floor(Math.random() * count.length);
        if (randomIndexArray.indexOf(randomNum) === -1) {
          randomIndexArray.push(randomNum);
        } else {
          i--;
        }
      }

      for (var randIndex of randomIndexArray) {
        var randValue = count[randIndex];
        var empInsert =
          'insert into currentduty (month, date, teamno, deptno, empno, shiftCode) values("' +
          nextMonth +
          '","' +
          ("00" + nightDates[j].toString()).slice(-2) +
          '","' +
          randValue.teamNo +
          '","' +
          randValue.deptNo +
          '","' +
          randValue.empNo +
          "\",'N')";
        connection.query(empInsert, function (err, result2) {
          console.log("일반근무자 배치완료");
        });
      }
    }
  }
}

app.get("/nightTurn", function (req, res) {
  var mdCodeSelector =
    "select empNo, teamNo, deptNo from emp where substring(statRule,3,1)=1";
  var prgCodeSelector =
    "select empNo, statRule from emp where substring(statRule, 1,1)=1";
  var precepteeArrange =
    "select empno, preceptor from emp where preceptor is not null";

  //임산부 안내
  connection.query(prgCodeSelector, function (err, result) {
    for (var data of result) {
      console.log("[임산부]", data.empNo);
      console.log("**나이트 근무 배치 불가**");
    }
  });

  //상근근무자 배치(공휴일 제외 주중근무)
  connection.query(mdCodeSelector, function (err, result) {
    var workdays = [];
    mdWorkingDays(year, nextMonth, function (wkndList) {
      for (a = 0; a < wkndList.length; a++) {
        workdays.push(wkndList[a]);
      }
      for (var data of result) {
        for (b = 0; b < workdays.length; b++) {
          connection.query(
            'insert into currentduty (month, date, teamNo, deptNo, empNo, shiftCode) values ("' +
              nextMonth +
              '","' +
              ("00" + workdays[b].toString()).slice(-2) +
              '",' +
              data.teamNo +
              "," +
              data.deptNo +
              "," +
              "'" +
              data.empNo +
              "', 'MD')"
          );
        }
      }
      console.log("상근 근무자 배치완료");
    });
  });

  //나이트킵, 일반근무자 프리셉터 코드를 가진 사람들을 레벨 코드에 따라 일정 비율로 나누어 N 배치한 코드
  var teamNurse =
    "SELECT deptNo, teamNo, empNo, levelCode, statRule FROM hospital.emp where statRule=00000 or statRule=00010 or statRule=01000;";

  let count4 = new Array();
  let count3 = new Array();
  let count2 = new Array();
  var count1 = new Array();

  connection.query(teamNurse, function (err, result) {
    for (var data of result) {
      if (data.levelCode == "1000") {
        count4.push(data);
      } else if (data.levelCode == "0001") {
        count1.push(data);
      } else if (data.levelCode == "0100") {
        count3.push(data);
      } else {
        count2.push(data);
      }
    }

    var res_4 = empRateRound(count4, 0.2);
    //console.log(typeof(res_4));
    var res_3 = empRateRound(count3, 0.3);
    //console.log(result3);
    var res_2 = empRateRound(count2, 0.3);
    //console.log(result2);
    var res_1 = empRateRound(count1, 0.2);
    //console.log(res_1);

    calculEmpNum(res_4, count4);
    calculEmpNum(res_3, count3);
    calculEmpNum(res_2, count2);
    calculEmpNum(res_1, count1);

    //프리셉티 근무 배치
    connection.query(precepteeArrange, function (err, result) {
      for (var data of result) {
        connection.query(
          "insert into currentduty (month,date,teamno,deptno,empno,shiftCode) select month, date, teamno, deptno," +
            data.empno +
            ", shiftCode from currentduty where empno=" +
            data.preceptor
        );
        console.log(
          "동일 듀티 배치를 확인하세요:",
          data.preceptor,
          "&",
          data.empno
        );
      }
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
              //nShift.push(nightAndOff);
              //console.log(nShift);
              connection.query(nightAndOff, function (err, result3) {
                //console.log(`${result3.length}`+"개의 OF 배치 완료");
                console.log("OF배치완료");
                //nShift.push(result3);
              });
            }
            //console.log(nShift);
          });
        }
      });
    });
    //res.send("기초시프트 배치완료");
  });
  setTimeout(function(){
    //res.redirect('http://localhost:3000/teamDutyAdmin');
    res.redirect('https://dutyweb.azurewebsites.net/teamDutyAdmin');
  }, 30000);
  //res.send("기초시프트 배치완료");
});

module.exports = app;
