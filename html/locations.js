// Global variables
let currentLatitude = null;
let currentLongitude = null;
let isGetLocationSuccessful = false;
let isHelpBlockDisplayed = false;
const googleMapsUrl = "https://www.google.com/maps/search/?api=1&query=";
const urlParamDelimiter = ",";


// Messages to be displayed to the user on the webpage
const noSearchWordMessage = "Enter something to get started.";


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
  // Display an error message and make site unusable
  if (!isGetLocationSuccessful) {
    $(".loader-wrapper").fadeOut("slow");
    $("#error-banner-location").removeClass("is-hidden");
    $("fieldset").attr("disabled", true);
  }

  // Forget previous errors if any
  $(":text").click(function() {
    $("#searchWord").removeClass("is-empty");
    $(".help-block").html("");
    isHelpBlockDisplayed = false;
  });

  $(".loader-wrapper").fadeOut("slow");
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
      if (!isHelpBlockDisplayed) {
        $("#searchWord").addClass("is-empty");
        $(".help-block").append(noSearchWordMessage);
        isHelpBlockDisplayed = true;
      }
      return;
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
      var template = Handlebars.compile($('#results-row').html());
      var results = template(outletsToDisplay);

      $("#results-description").append(data.messageToUser);
      $("#outletResults").append(results);

      $("section").removeClass("search-pg");
      $("section").addClass("results-pg");
      $("#search-body").addClass("is-hidden");
      $("#results-body").removeClass("is-hidden");
      $("#btn-back-to-search").removeClass("is-hidden");
    }).fail(function() {
      console.error("Request to server failed");
    }).always(function() {
      console.log("Request to server completed.");
    });
  });

  // Check for click events on the navbar burger icon
  $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
  });

  // Switch page shown when back to search button is clicked
  $("#btn-back-to-search").click(function(event) {
    $("section").removeClass("results-pg");
    $("section").addClass("search-pg");
    $("#search-body").removeClass("is-hidden");
    $("#results-body").addClass("is-hidden");
    $("#btn-back-to-search").addClass("is-hidden");

    $("#outletResults").html("");
    $("#results-description").html("");
  });

  // Functionality for back to top button
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
