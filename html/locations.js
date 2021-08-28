// Global variables
let currentLatitude = null;
let currentLongitude = null;
let isGetLocationSuccessful = false;


// Messages to be displayed to the user on the webpage
const locationHelpMessage = `
  We're sorry! NearMe was unable to determine your location. This could be due to the following reasons:<br>
  1) NearMe does not have permission to get your location.
  \t- Allow location services for NearMe in your browser. Then, refresh the page.<br>
  2) NearMe has permission, but is unable to get your correct/precise location.
  \t- In your browser's settings, ensure sites are allowed to ask for your location.<br>
  3) Network connectivity issues :(
  \t- Please try again later.<br>
  Refer to the NearMe guide for more information.
`;
const noSearchWordMessage = "Enter something to get started.";
const noRadiusMessage = "<strong>No distance limit selected. Showing all outlets found.</strong><br></br>";

// Retrieves the latitude and longitude of the user's current location
async function geoGetCurrentLocation() {
  try {
    const pos = await new Promise((resolve, reject) => {
      var options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

    currentLatitude = pos.coords.latitude;
    currentLongitude = pos.coords.longitude;
  
    return true;
  } catch (error) {
    return false;
  }
}


$(document).ready(async function() {
  isGetLocationSuccessful = await geoGetCurrentLocation();
  console.log("Successfully got location:", isGetLocationSuccessful);
  console.log("Lat, long:", currentLatitude, currentLongitude);
  if (!isGetLocationSuccessful) {
    var template = Handlebars.compile($(".message-template").html());
    var results = template({
      messageToUser: {
        message: locationHelpMessage
      }
    });
    $(".messages").append(results);
    $("fieldset").attr("disabled", true);
  }

  // Forget previous errors if any
  $(":text").click(function() {
    $("#searchWord").removeClass("is-empty");
    $(".help-block").remove();
  });

  bulmaSlider.attach();

  $(":submit").click(function(event) {
    // Prevent the form from posting
    event.preventDefault();

    if (!isGetLocationSuccessful) {
      console.log("User prevented from sending data to server.");
      return;
    }

    // Flush previously displayed results
    $("#outletResults").html("");
    $("#results-description").html("");

    var params = {
      searchWord: $("#searchWord").val(),
      radius: $("#radiusSelect").val(),
      currentLatitude: currentLatitude,
      currentLongitude: currentLongitude
    };

    if (params.searchWord.length == 0) {
      $("#searchWord").addClass("is-empty");
      $(`<div class='help-block'>${noSearchWordMessage}</div>`)
      .appendTo("#search-bar"); //TO-FIX
      return;
    }

    if (isNaN(parseFloat(params.radius))) {
      var template = Handlebars.compile($(".message-template").html());
      var results = template({
        messageToUser: {
          message: noRadiusMessage
        }
      });
      $(".messages").append(results);
    }
    
    const url = "/outlets";
    $.getJSON(url, params, function(data) {
      Handlebars.registerHelper('hasRemainingOutlets', function(data) {
        return (data.length > 0);
      })

      let topThree = data.outlets, remainingOutlets = [];
      if (data.outlets.length > 3) {
        topThree = data.outlets.slice(0, 3);
        remainingOutlets = data.outlets.slice(3);
      }

      let outletsToDisplay = {topThree: topThree, remainingOutlets: remainingOutlets};
      console.log('outletsToDisplay:', outletsToDisplay)
      var template = Handlebars.compile($('#result-row').html());
      var results = template(outletsToDisplay);

      $("#results-description").append(data.messageToUser);
      $("#outletResults").append(results);

      $("#search-page").addClass("is-hidden");
      $("#results-page").removeClass("is-hidden");
    }).fail(function() {
      console.error("Request to server failed");
    }).always(function() {
      console.log("Request to server completed.");
    });
  });

  $(":reset").click(function(event) {
    $("#search-page").removeClass("is-hidden");
    $("#results-page").addClass("is-hidden");
    $("#outletResults").html("");
    $("#results-description").html("");
  });

  window.onscroll = function () {
    scrollFunction();
  };

  function scrollFunction() {
    if (
      document.body.scrollTop > 20 ||
      document.documentElement.scrollTop > 20
    ) {
      $("#btn-back-to-top").css("display", "block");
    } else {
      $("#btn-back-to-top").css("display", "none");
    }
  }

  $("#btn-back-to-top").click(function(event) {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  });

});
