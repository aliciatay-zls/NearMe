// Global variables
let currentLatitude = null;
let currentLongitude = null;
let isGetLocationSuccessful = false;


// Messages to be displayed to the user on the webpage
const locationHelpMessage = `
    Unable to determine location. This could be due to the following reasons:\n
    1) NearMe does not have permission to get your location.
    \t- Allow location services for NearMe in your browser. Then, refresh the page.\n
    2) NearMe has permission, but is unable to get your correct/precise location.
    \t- In your browser's settings, ensure sites are allowed to ask for your location.\n
    Refer to the NearMe guide for more information.
`;
const noSearchWordMessage = "Enter something to get started.";
const noRadiusMessage = "No distance limit selected. Displaying all outlets found.";


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
        $(`<div class='help-block'>${locationHelpMessage}</div>`)
        .appendTo("#outletResults");
    }

    $(":submit").click(function(event) {
        // Prevent the form from posting
        event.preventDefault();

        if (!isGetLocationSuccessful) {
            return;
        }

         // Flush previously displayed results, forget previous errors if any
        $("#outletResults").html("");
        $(".form-inputs").removeClass("is-empty");
        $(".help-block").remove();

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
            $("#outletResults").append(`<b>${noRadiusMessage}</b><br></br>`);
        }
        
        const url = "/outlets";
        $.getJSON(url, params, function(data) {
            var toDisplay = [], entry = [];
            toDisplay.push(`<b>${data.messageToUser}</b><br></br>`);
            $.each(data.outlets, function(key, val) {
                entry.push(
                    "<li id='", key, "'>", val.name, "</li>",
                    "<p class='distance'>", val.distance, " km away", "</p>",
                    "<div class='details'>",
                    "<p class='details-header'>", "Outlet information", "</p>",
                    "<ul>",
                    "<li class='postal'>", "Postal code: ", val.postal, "</li>",
                    "<li class='contact'>", "Phone: ", val.contact, "</li>",
                    "<li class='closing'>", "Closes: ", val.closing, "</li>",
                    "</ul>",
                    "</div>"
                );
                toDisplay.push(entry.join(""));
                entry = [];
            });
            $("<ol/>", {
                html: toDisplay.join('\r\n')
            }).appendTo("#outletResults");
        }).fail(function() {
            console.error("failed");
        }).always(function() {
            console.log("complete");
        });
    });
});
