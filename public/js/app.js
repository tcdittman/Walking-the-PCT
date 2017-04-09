//date stuff
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

var $theDate = $('<p>Today\'s date is ' + thisDay + '</p>');

var totalSteps = 0; //the variable that stores the total count

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


$(document).ready(function() {

  //setup the button to manually submit steps to the database
  $('#step-form').submit(function (event) {
      event.preventDefault()
      var numSteps = $('#someSteps').val()
      //totalSteps += parseInt(numSteps); //add manual steps to the current total TESTING
      $('#someSteps').val('')

      //add manual steps to a section in the db
      var dailyStepsReference = stepLogDatabase.ref('dailysteps');
      dailyStepsReference.push({
          steps: numSteps,
          date: thisDay
      });
      //setTimeout(generateProgress(), 1000); //update the progress map with manual steps
  });
  getSteps(); //display database steps in the DOM


  //API call to pull step data from Withings
  var urlStart = 'https://wbsapi.withings.net/v2/measure?action=getactivity&startdateymd=2017-01-01';
  var tokenAppend = '&access_token=29689693dc945ece98987cb8a9c3941596cdc17a';

  //function to sum all the steps from the API call, stored in totalSteps
  function sumSteps (results) {
    results.body.activities.forEach(function(day) {
      if (day.steps === 0) {}
      else {
        totalSteps += (day.steps);
        /* if I ever want to push API data into the backend database
        (need an if/else to only push new entries)
        var dailyStepsReference = stepLogDatabase.ref('dailysteps');
        dailyStepsReference.id.date??
        dailyStepsReference.push({
            steps: day.steps,
            date: day.date
        });
        */
      }
    });
    console.log("totalSteps at point 0 = " + totalSteps);

    generateProgress(); // display step data in the DOM

  };
  $.get(urlStart + endDate + tokenAppend, sumSteps); // make the API call!
console.log("totalSteps at point -1 = " + totalSteps);
});

//Using totalSteps, generate the values to display in the DOM
function generateProgress(){
  var annualMiles = Math.round(totalSteps/1973.8318);
  console.log("total annual miles = " + annualMiles);

  var percentOfPct = (annualMiles/2650*100);

  var roundedPercentOfPct = (Math.round(percentOfPct * 100) / 100);

  //because the map is 90% of the width of the page
  var roundedPercentOfMap = (Math.round(percentOfPct * 100 * .9) / 100) + "%";

  //display the progress in the DOM
  $('.pctprogressmapmarker').css('width', roundedPercentOfMap);
  $("#today").empty();
  var $yearSteps = $('<p>I\'ve walked ' + totalSteps + ' steps this year.</p>');
  var $yearMiles = $('<p>That\'s about ' + annualMiles + ' miles "hiked" this year.</p>');
  var $percentPCT = $('<p>Which is ' + roundedPercentOfPct + '% of the PCT.</p>');
  $("#today").append($theDate, $yearSteps, $yearMiles, $percentPCT);
};


//display database steps in the DOM
function getSteps() {
    stepLogDatabase.ref('dailysteps').on('value', function (results) {
      var $stepList = $('.stepList');
      var datesWithSteps = [];

      var allDays = results.val();
      // iterate through results coming from database call;
      for (var day in allDays) {
        var stepz = allDays[day].steps;
        var dayte = allDays[day].date;

        //get the steps value for each db entry!
        function addTheseSteps(data){
          data2 = parseInt(data);
          totalSteps += data2;
        };
        $.get('https://hiking-the-pct.firebaseio.com/dailysteps/' + day + '/steps.json', addTheseSteps);

        //create a list element for each manual date
        var $dateListElement = $('<li>');

        // create delete element
        var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>');
        $deleteElement.on('click', function (e) {
          console.log("totalSteps at point 1 = " + totalSteps);
          var id = $(e.target.parentNode).data('id')
          deleteDay(id);
          console.log("totalSteps at point 2 = " + totalSteps);

        //  generateProgress();
        });

        // add id as data attribute so we can refer to later for updating
        $dateListElement.attr('data-id', day);

        // add step count to li
        $dateListElement.html(stepz);

        // add delete element
        $dateListElement.append($deleteElement);


        // show the corresponding date
        $dateListElement.append('<div>Date: ' + dayte + '</div><br>');

        // push element to array of step data
        datesWithSteps.push($dateListElement);
      }

      $stepList.empty();
      for (var i in datesWithSteps) {
        $stepList.append(datesWithSteps[i]);
      }
      setTimeout(function(){
      console.log("totalSteps A = " + totalSteps);
      generateProgress();
      console.log("totalSteps B = " + totalSteps);
    }, 1000);
  });
};

//function to run when the delete element is clicked
function deleteDay(id) {
  console.log("totalSteps at point 3 = " + totalSteps);

  //subtract from running total in DOM
  function removeTheseSteps(data){
    data2 = parseInt(data);
    totalSteps -= data2;
  };
  $.get('https://hiking-the-pct.firebaseio.com/dailysteps/' + id + '/steps.json', removeTheseSteps);
  console.log("totalSteps at point 4 = " + totalSteps);

  //remove from database
  var dayReference =  stepLogDatabase.ref('dailysteps').child(id);
  setTimeout(function(){
    dayReference.remove();
    console.log("totalSteps at point 5 = " + totalSteps);

    generateProgress();
  }, 500);
  console.log("totalSteps at point 6 = " + totalSteps);
};
