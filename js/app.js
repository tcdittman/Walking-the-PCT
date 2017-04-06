/*
Technical challenges:
- oauth token
- each day having to refresh token
*/
$(document).ready(function() {

  var thisDay;
  var endDate;


  var todaysDate = (function() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd;
    }

    if(mm<10) {
        mm='0'+mm;
    }

    today = mm+'/'+dd+'/'+yyyy;
    thisDay = today;
    endDate = '&enddateymd='+ yyyy + '-' + mm + '-' + dd;
  })();

  console.log("today is " + thisDay);
  var $theDate = $('<p>Today\'s date is ' + thisDay + '</p>');

  var $Steps = $('<p>Today\'s date is ' + thisDay + '</p>');
  $("#today").append($theDate);

  var urlStart = 'https://wbsapi.withings.net/v2/measure?action=getactivity&startdateymd=2017-01-01';

  //var endDate = '&enddateymd=2017-04-03';
  var tokenAppend = '&access_token=2b212c8cf41fe9b4d5ba4651cebefeedb9a9893d';

  var printMe = function(results) {
    results.body.activities.forEach(function(day) {
      console.log(day.steps);
    });
  };
  $.get(urlStart + endDate + tokenAppend, printMe);



});
