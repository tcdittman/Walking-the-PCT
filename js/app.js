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
//$("#today").append($theDate);

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

var stepLogDatabase = firebase.database();


var totalSteps = 0; //the variable that stores the total count

$(document).ready(function() {


  console.log("the beginning. total steps are zero: "  + totalSteps);
  //manually submitted steps get sent to the database
  $('#step-form').submit(function (event) {
      event.preventDefault()
      var numSteps = $('#someSteps').val()
      totalSteps += parseInt(numSteps);
      console.log("what are total steps? ... "  + totalSteps);
      $('#someSteps').val('')

      // create a section for daily step data in the db
      var dailyStepsReference = stepLogDatabase.ref('dailysteps');
      dailyStepsReference.push({
          steps: numSteps,
          date: thisDay
      });
      generateProgress();
  });
  getSteps();


  var urlStart = 'https://wbsapi.withings.net/v2/measure?action=getactivity&startdateymd=2017-01-01';

  var tokenAppend = '&access_token=09d242476caa28b272bf68018545d928c903f7d3';

  //add up the steps for all the days in the API call and store in totalSteps
  var sumSteps = function(results) {
    results.body.activities.forEach(function(day) {
      if (day.steps === 0) {}
      else {
        totalSteps += (day.steps);
        console.log("this day's steps: " + day.steps);
        console.log("miles travelled this day: " + Math.round(day.steps/1973.8318));
        var dailyStepsReference = stepLogDatabase.ref('dailysteps');
        // need an if/else to only push new entries
        //dailyStepsReference.id.date??
        //dailyStepsReference.push({
        //    steps: day.steps,
        //    date: day.date
      //  });
      }
    });
    console.log("total annual steps = " + totalSteps);
    generateProgress();

  };
  $.get(urlStart + endDate + tokenAppend, sumSteps);
});

//Using totalSteps, generate the values to display in the DOM
function generateProgress(){
  var annualMiles = Math.round(totalSteps/1973.8318);
  console.log("total annual miles = " + annualMiles);

  var percentOfPct = (annualMiles/2650*100);
  console.log("this percentage of the PCT: " + percentOfPct);

  var roundedPercentOfPct = (Math.round(percentOfPct * 100) / 100);
  console.log("rounded percentage of the PCT: " + roundedPercentOfPct);

  var roundedPercentOfMap = (Math.round(percentOfPct * 100 * .9) / 100) + "%";
  console.log("rounded percentage for the map: " + roundedPercentOfMap);

  //display the progress in the DOM
  $('.pctprogressmapmarker').css('width', roundedPercentOfMap);

  $("#today").empty();
  var $yearSteps = $('<p>I\'ve walked ' + totalSteps + ' steps this year.</p>');
  var $yearMiles = $('<p>That\'s about ' + annualMiles + ' miles "hiked" this year.</p>');
  var $percentPCT = $('<p>Which is ' + roundedPercentOfPct + '% of the PCT.</p>');
  $("#today").append($theDate, $yearSteps, $yearMiles, $percentPCT);
};



function getSteps() {
    stepLogDatabase.ref('dailysteps').on('value', function (results) {
      var $stepList = $('.stepList');
      var datesWithSteps = [];

      var allDays = results.val();
      // iterate through results coming from database call;
      for (var day in allDays) {
        var stepz = allDays[day].steps;
        var dayte = allDays[day].date;
        //totalSteps += stepz;
        //create a list element for each manual date
        var $dateListElement = $('<li>');

        // create delete element
        var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>');
        $deleteElement.on('click', function (e) {
          var id = $(e.target.parentNode).data('id')
          deleteDay(id);
          generateProgress();
        });


        // add id as data attribute so we can refer to later for updating
        $dateListElement.attr('data-id', day);

        // add message to li
        $dateListElement.html(stepz);

        // add delete element
        $dateListElement.append($deleteElement);


        // show votes
        $dateListElement.append('<div>Date: ' + dayte + '</div><br>');

        // push element to array of messages -- this is pushing to an array, not HTTP push
        datesWithSteps.push($dateListElement);
      }

      // remove lis to avoid dupes
      // .empty() is a jQuery method to remove all child nodes
      $stepList.empty();
      for (var i in datesWithSteps) {
        $stepList.append(datesWithSteps[i]);
      }
    });
  }

function deleteDay(id) {
  var dayReference =  stepLogDatabase.ref('dailysteps').child(id);
  dayReference.remove();
  generateProgress();
};
