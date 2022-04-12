const express = require("express");
const bodyParser = require("body-parser");
const app = express();
var fs = require('fs');
var mysql = require('mysql');
const path = require('path');
const {connection} = require("../config/dao.js");
  const holidays = require('holidays-kr');
  holidays.serviceKey = '2DA93J%2BpAcN2rk%2FqZFXmjsIem1Jp7ujROUeQReR8ER5NyVp2Khuuk4CBvmhl9iCiBHsf1UXC18Haf%2FTEILDNlQ%3D%3D';

/**
 * 파일 명 : finalAssign.js
 * @author : 문승연
 * @date : 2022-04-08
 * @description : D/E/OFF/잔여ho 최종 배치
*/


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : false}));
app.use(express.json());
app.use(express.urlencoded({extended : true}));


//날짜 정의
let today = new Date();

year = today.getFullYear(); //올해년도
nextMonth = String(today.getMonth() + 2).padStart(2, "0");//작성일 기준 다음달
firstDate = new Date(year,parseInt(nextMonth),1).getDate(); //해당월 첫 날
lastDate = new Date(year,parseInt(nextMonth)+1,0).getDate(); //해당월 마지막날
if((year%4===0 && year % 100 !==0) || year%400===0) { //윤년 적용
    lastDate[1]=29;
}



//날짜 범위 안에서 랜덤한 숫자출력
function randomDate(min, max) {
    getDutyDates = Math.floor(Math.random() * (max - min + 1)) + min;
    return getDutyDates;
}
//중복체크 함수
function getDateArray(min,max,count){
    if(max - min +1 < count)
    return;

    var randomDateArray = [];

    while(1){
        var index = randomDate(min, max);
        if (randomDateArray.indexOf(index)>-1){
            continue;
        }
        randomDateArray.push(index);
        if (randomDateArray.length == count){
            break;
        }
    } 
    //return randomDateArray;
    return randomDateArray.sort(function (a, b) {
        return a - b;
    });
}


//그 달 주말 담기
function weekendPicker(year,month){
    var thisMonthDates=wholeDates(firstDate,lastDate)
    var wkndList=[]
    
    for (i=0; i<thisMonthDates.length; i++){
        wknd = new Date("'"+year+"-"+month+"-"+thisMonthDates[i]+"'").getDay();
        if (wknd==0 || wknd == 6){
            wkndList.push(thisMonthDates[i])
        }
        console.log("주말/주휴")
    }
}

    //그달 공휴일
    function hoPicker(year, month, callback) {
        var hoDates = []
      holidays.getHolidays({
        year : year,        // 수집 시작 연도
        month : parseInt(month),         // 수집 시작 월
        monthCount : 1     // 수집 월 갯수
        }).then(list => {
          for(var i=0; i<list.length; i++){
            hoDates.push(list[i][Object.keys(list[i])[3]]); //해당월 day의 value만 push
        };
            return callback(hoDates);
      });
    };


//상근자용 날짜 함수
//한달 전체 리스트 출력
function wholeDates(startDate,endDate){
    var totalDate = [];
    let i=startDate;

    while(true){
        totalDate.push(i);
        if( i == endDate){
            break;
        }
        i++;
    } 
    return totalDate;
}

//해당월 주말+공휴일 제외한 배정가능 날짜 출력
function mdWorkingDays(year, month, callback){
    var thisMonthDates=wholeDates(firstDate,lastDate)
    var wkndList=[]

    for (i=0; i<thisMonthDates.length; i++){
        wknd = new Date("'"+year+"-"+month+"-"+thisMonthDates[i]+"'").getDay();
        if (wknd != 0  &&  wknd != 6){
            wkndList.push(thisMonthDates[i])
        }
    }
    holidays.getHolidays({
        year: year,
        month: parseInt(month),
        monthCount: 1
    }).then(list=>{
        for(var i=0; i<list.length; i++){
            var selectedHo =  list[i][Object.keys(list[i])[3]]
            for (var j=0; j<wkndList.length; j++){
                if (wkndList[j]== selectedHo){
                    wkndList.splice(j,1);  
                    j--;
                }
            }
        }
        return callback(wkndList);
    });
}


//한달 전체 리스트 출력
function wholeDates(startDate,endDate){
    var totalDate = [];
    let i=startDate;

    while(true){
        totalDate.push(i);
        if( i == endDate){
            break;
        }
        i++;
    } 
    return totalDate;
}


//현재 배정된 날짜 가져오기
var assignedDates = []
function savedDates(empNo,callback){
    connection.query("select date from currentduty where empNo="+empNo, function(err, result){
        for (var data of result){
            assignedDates.push(data.date)
        }
       return callback(assignedDates);            
    })
}

//(배정된 날짜 제외) 원티드 신청 일자 출력
function availableDate(empNo,callback){
    var thisMonthDates=wholeDates(firstDate,lastDate)

    savedDates(empNo, function(assignedDates){
        for (i=0; i<assignedDates.length; i++){
            thisMonthDates = thisMonthDates.filter(function(item){
                return item != assignedDates[i];
            });
        };
       return callback(thisMonthDates);
        });
};


app.get('/finalAssign', function(req,res){
    var leftWorkdays = []
    var finalEmps = "SELECT deptNo, teamNo, empNo, levelCode, statRule FROM hospital.emp where statRule=00000 or statRule=00010 and deptNo='100'SELECT deptNo, teamNo, empNo, levelCode, statRule FROM hospital.emp where statRule=00000 or statRule=00010 and deptNo='100'"
    connection.query(finalEmps, function(err, result){
        for (var data of result){
            availableDate(data.empNo, function(thisMonthDates){
                for (i=0; i<thisMonthDates.length; i++){
                    connection.query("insert into currentduty (month, date, teamNo, deptNo, empNo, shiftCode) values (\"" + nextMonth + '","' + ("00" + thisMonthDates[i].toString()).slice(-2) + '",'+data.teamNo+','+ data.deptNo+ ','+ "'"+data.empNo+"', '잔여일수정')")
                }
            })
        }
        console.log("상근 근무자 배치완료")
    })

 //
});

module.exports = app;