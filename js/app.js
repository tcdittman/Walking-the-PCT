/*
Technical challenges:
- oauth token
- each day having to refresh token
*/

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
  $("#today").append($theDate);

// Initialize Firebase
var config = {
  apiKey: "AIzaSyBysEIDdT9Luxq0nac_dE67dF9D3OVch3k",
  authDomain: "hiking-the-pct.firebaseapp.com",
  databaseURL: "https://hiking-the-pct.firebaseio.com",
  projectId: "hiking-the-pct",
  storageBucket: "hiking-the-pct.appspot.com",
  messagingSenderId: "537168912123"
};
firebase.initializeApp(config);

var stepLogReference = firebase.database();



$(document).ready(function() {
  //manually submitting steps
  $('#step-form').submit(function (event) {
      event.preventDefault()
      var numSteps = $('#someSteps').val()
      $('#someSteps').val('')

      // create a section for daily step data in the db
      var dailyStepsReference = stepLogReference.ref('dailysteps');
      dailyStepsReference.push({
          steps: numSteps,
          date: thisDay
      });
      console.log("dailyStepsReference = " + dailyStepsReference);
      $('#step-form').addClass('hidden');
  });




  var urlStart = 'https://wbsapi.withings.net/v2/measure?action=getactivity&startdateymd=2017-01-01';

  var tokenAppend = '&access_token=f855c3a7396218f1888dd2d556ece7520d2e210e';

  var totalSteps = 0;
  var sumSteps = function(results) {

    results.body.activities.forEach(function(day) {
      totalSteps += (day.steps);
      console.log(day.steps);
    });
    console.log("total steps = " + totalSteps);
    var $yearSteps = $('<p>I\'ve walked ' + totalSteps + ' steps this year.</p>');
    $("#today").append($yearSteps);

  };
  $.get(urlStart + endDate + tokenAppend, sumSteps);


});
