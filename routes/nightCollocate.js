const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var mysql = require("mysql");
const { connection, nightAfterOff } = require("../config/dao.js");

/**
 * 파일 명 : nightCollocate.js
 * @author : 주민지
 * @date : 2022-04-02
 * @description : 나이트 근무 배치 룰 1. 근무 인원의 숙련도에 따라 비율에 맞게 근무 인원을 나눈다.
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const holidays = [
  { year: 2022, month: 1, date: 1, title: "새해첫날" },
  { year: 2022, month: 1, date: 31, title: "설날" },
  { year: 2022, month: 2, date: 1, title: "설날" },
  { year: 2022, month: 2, date: 2, title: "설날" },
  { year: 2022, month: 3, date: 1, title: "삼일절" },
  { year: 2022, month: 3, date: 9, title: "대통령선거일" },
  { year: 2022, month: 5, date: 5, title: "어린이날" },
  { year: 2022, month: 5, date: 8, title: "부처님오신날" },
  { year: 2022, month: 6, date: 1, title: "전국동시지방선거" },
  { year: 2022, month: 6, date: 6, title: "현충일" },
  { year: 2022, month: 8, date: 15, title: "광복절" },
  { year: 2022, month: 9, date: 9, title: "추석" },
  { year: 2022, month: 9, date: 10, title: "추석" },
  { year: 2022, month: 9, date: 11, title: "추석" },
  { year: 2022, month: 9, date: 12, title: "대체공휴일" },
  { year: 2022, month: 10, date: 3, title: "개천절" },
  { year: 2022, month: 10, date: 9, title: "한글날" },
  { year: 2022, month: 10, date: 10, title: "대체공휴일" },
  { year: 2022, month: 12, date: 25, title: "크리스마스" },
];

// 날짜 범위 안에서 랜덤한 숫자출력
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

  var nightDates = getDateArray(firstDate, lastDate, 31);
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
      //console.log(randomIndexArray)

      for (var randIndex of randomIndexArray) {
        var randValue = count[randIndex];
        //console.log(randValue.empNo);

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

        //console.log(empInsert);
        connection.query(empInsert, function (err, result2) {
          //console.log(result2)
          console.log("데이터 insert");
        });
      }
    }
  }
}

app.get("/api/emp/check", function (res, req) {
  console.log(datePicker(firstDate, lastDate));
  console.log(randomDate(firstDate, lastDate));
});

let today = new Date();

year = today.getFullYear(); //올해년도
nextMonth = String(today.getMonth() + 2).padStart(2, "0"); //작성일 기준 다음달
firstDate = new Date(year, nextMonth, 1).getDate(); //해당월 첫 날
lastDate = new Date(year, nextMonth + 1, 0).getDate(); //해당월 마지막날

if ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) {
  //윤년 적용
  lastDate[1] = 29;
}

app.get("/collo", function (res, req) {
  var teamNurse =
    "SELECT deptNo, teamNo, empNo, levelCode, statRule FROM hospital.emp where deptNo=100 and teamNo=1001 and (statRule=00000 or statRule=00010 or statRule=01000);";

  let count4 = new Array();
  let count3 = new Array();
  let count2 = new Array();
  var count1 = new Array();

  connection.query(teamNurse, function (err, result) {
    //console.log(result);
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

    //console.log(typeof(count4.length));

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
  });
});
//connection.connect(); //db접속
//nightAfterOff();
//connection.end();

module.exports = app;
