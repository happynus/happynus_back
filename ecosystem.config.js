module.exports = {
  apps: [
    {
      name: "app", //App name
      script: "./app.js", //실행할 스크립트
      instances: 1, //CUP 코어 수 만큼 프로세스 생성(-1:코어수만큼 프로세스 생성)
      exec_mode: "cluster", //CPU 사용을 위한 클러스터 모드
      listen_timeout: 50000, // 앱 실행 신호까지 기다릴 최대 시간. ms 단위.
      kill_timeout: 50000, // 새로운 프로세스 실행이 완료된 후 예전 프로세스를 교체하기까지 기다릴 시간
      time: true, // pm2 log 에서 콘솔들의 입력 시간이 언제인지 확인 가능
      //bin폴더, routes폴더를 감시해서 변경사항 실행
      //watch: ["public", "routes"],
      watch : true,
      //해당폴더의 파일변경은 무시
      ignore_watch: ["node_modules"],
    },
  ],
};
