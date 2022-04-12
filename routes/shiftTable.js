const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const axios = require("axios");

/**
 * 파일 명 : shiftTable.js
 * @author : 주민지
 * @date : 2022-04-09
 * @description : shiftTable을 만들기 위한 api.
 */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//전 사원 정보를 가져옴
const getEmpData = async () => {
  let empData = await axios.get(
    "https://dutyapi-dutyapi-test.azurewebsites.net/api/emp"
  );
  //console.log(shift.data);
  return empData.data;
};

//사원들의 Night시프트와 OF시프트를 가져옴
const getShift = async () => {
  let shift = await axios.get(
    "https://dutyapi-dutyapi-test.azurewebsites.net/api/orderDuty"
  );
  //console.log(shift.data);
  return shift.data;
};
//console.log(getShift());

// //중복을 없엔 사원들의 사번 정보를 가져옴
// const getNDistint = async () => {
//   let dist = await axios.get(
//     "https://dutyapi-staging.azurewebsites.net/api/distinct"
//   );
//   //console.log(dist.data);
//   return dist.data;
// };

var empTotal = [];
getEmpData().then((emp1) => {
  emp1.map((emp2) => {
    let teamNo = emp2.teamNo;
    let position = emp2.position;
    let empNo = emp2.empNo;
    let empName = emp2.empName;
    const duty = [
      ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ',
      ' ', ' ', ' ', ' ', ' ', ' ',
    ];
    getShift().then((shift1) => {
      shift1
        .filter((shift2) => shift2.month === "05")
        .map((shift2) => {
          if (emp2.empNo == shift2.empNo) {
            //console.log(Nshift.shiftCode);
            //console.log(Nshift.date);
            duty.splice(parseInt(shift2.date) - 1, 1, shift2.shiftCode);
            //console.log(date2);
          }
        });
      //let shiftN = { [keyName.toString()]: date };
      let shiftN = { teamNo : teamNo, position : position, empNo : empNo, empName : empName, duty : duty};
      empTotal.push(shiftN);
    });
  });
  app.get("/shiftTable", (req, res) => {
    //res.send(empTotal);
    res.render("shiftTable", { emplist: empTotal });
  });
});

module.exports = app;