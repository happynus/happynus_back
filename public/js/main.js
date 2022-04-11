$(function() {

    $('.js-check-all').on('click', function() {
  
        if ( $(this).prop('checked') ) {
            $('th input[type="checkbox"]').each(function() {
                $(this).prop('checked', true);
          $(this).closest('tr').addClass('active');
            })
        } else {
            $('th input[type="checkbox"]').each(function() {
                $(this).prop('checked', false);
          $(this).closest('tr').removeClass('active');
            })
        }
  
    });
  
    $('th[scope="row"] input[type="checkbox"]').on('click', function() {
      if ( $(this).closest('tr').hasClass('active') ) {
        $(this).closest('tr').removeClass('active');
      } else {
        $(this).closest('tr').addClass('active');
      }
    });
  
      
  
  });
  
  
  function categoryChange(e) {
    const objTeam100 = {"입원간호 1팀" : 1001 , "입원간호 2팀" : 1002}
    const objTeam200 = {"신생아중환자실" : 2001 , "중환자실" : 2002}
    var team100 = Object.keys(objTeam100)
    var team200 = Object.keys(objTeam200)
    var target = document.getElementById("teamNo");
  
    if (e.value == "100") {
      var key = team100;
      var value = Object.values(objTeam100);
    }
    else if (e.value == "200") {
      var key = team200;
      var value = Object.values(objTeam200);
    }
    target.options.length = 0;
  
    for (x in key) {
      var opt = document.createElement("option");
      opt.value = value[x]; //select box를 통해 전달하고자 하는 값
      opt.innerHTML = key[x]; //select box를 통해 보여지는 요소 (여기선 key로 함)
      target.appendChild(opt);
    }
  }