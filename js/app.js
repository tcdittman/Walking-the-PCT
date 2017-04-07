/*
Technical challenges:
- oauth token - emailed Dev who wrote it
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

  var tokenAppend = '&access_token=8a62236f74b0b1c5d2e504fe7f2622bd90726276';

  var totalSteps = 0;
  var sumSteps = function(results) {

    results.body.activities.forEach(function(day) {
      if (day.steps === 0) {}
      else {
        totalSteps += (day.steps);
        console.log("this day's steps: " + day.steps);
        console.log("miles travelled this day: " + Math.round(day.steps/1973.8318));
      }
    });
    console.log("total annual steps = " + totalSteps);

    var annualMiles = Math.round(totalSteps/1973.8318);
    console.log("total annual miles = " + annualMiles);

    var percentOfPct = (annualMiles/2650*100);
    console.log("this percentage of the PCT: " + percentOfPct);

    var roundedPercentOfPct = (Math.round(percentOfPct * 100) / 100);
    console.log("rounded percentage of the PCT: " + roundedPercentOfPct);

    var roundedPercentOfMap = (Math.round(percentOfPct * 100 * .9) / 100) + "%";
    console.log("rounded percentage for the map: " + roundedPercentOfMap);

    $('.pctprogressmapmarker').css('width', roundedPercentOfMap);


    console.log("or this percentage of the JMT: " + (Math.round(annualMiles/210*100)));

    var $yearSteps = $('<p>I\'ve walked ' + totalSteps + ' steps this year.</p>');
    var $yearMiles = $('<p>That\'s about ' + annualMiles + ' miles "hiked" this year.</p>');
    var $yearMiles = $('<p>Which is ' + roundedPercentOfPct + '% of the PCT.</p>');
    $("#today").append($yearSteps, $yearMiles);

  };
  $.get(urlStart + endDate + tokenAppend, sumSteps);


});
