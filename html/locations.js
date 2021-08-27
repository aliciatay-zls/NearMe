// Global variables
let currentLatitude = null;
let currentLongitude = null;
let isGetLocationSuccessful = false;


// Messages to be displayed to the user on the webpage
const locationHelpMessage = `
  We're sorry! NearMe was unable to determine your location. This could be due to the following reasons:\n
  1) NearMe does not have permission to get your location.
  \t- Allow location services for NearMe in your browser. Then, refresh the page.\n
  2) NearMe has permission, but is unable to get your correct/precise location.
  \t- In your browser's settings, ensure sites are allowed to ask for your location.\n
  3) Network connectivity issues :(
  \t- Please try again later.\n
  Refer to the NearMe guide for more information.
`;
const noSearchWordMessage = "Enter something to get started.";
const noRadiusMessage = "No distance limit selected. Showing all outlets found.";


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
    $(`<div class='is-error'>${locationHelpMessage}</div>`)
    .appendTo(".messages");
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

    var params = {
      searchWord: $("#searchWord").val(),
      radius: $("#radiusSelect").val(),
      currentLatitude: currentLatitude,
      currentLongitude: currentLongitude
    };

    if (params.searchWord.length == 0) {
      $("#searchWord").addClass("is-empty");
      $(`<div class='help-block'>${noSearchWordMessage}</div>`)
      .appendTo("#search-bar");
      return;
    }

    if (isNaN(parseFloat(params.radius))) {
      $(".messages").append(`<b>${noRadiusMessage}</b><br></br>`);
    }
    
    const url = "/outlets";
    $.getJSON(url, params, function(data) {
      Handlebars.registerHelper('isTopThreeResult', function (index) {
        return (index < 3);
      });
      Handlebars.registerHelper('isTopResult', function (index) {
        return (index == 0);
      });
      Handlebars.registerHelper('isStartOfRemainingResults', function(index) {
        return (index == 3);
      })

      var template = Handlebars.compile($('#result-row').html());
      var results = template(data);

      $("#results-description").append(data.messageToUser);
      $("#outletResults").append(results);
      $("</div>").appendTo("#outletResults");

      $("#search-page").addClass("is-hidden");
      $("#results-page").removeClass("is-hidden");
    }).fail(function() {
      console.error("Request to server failed");
    }).always(function() {
      console.log("Request to server completed.");
    });
  });
});
