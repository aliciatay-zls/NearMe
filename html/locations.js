let currentLatitude = null;
let currentLongitude = null;
let isGetLocationSuccessful = false;

async function geoGetCurrentLocation() {
    try {
        const pos = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    
        currentLatitude = pos.coords.longitude;
        currentLongitude = pos.coords.latitude;
    
        return true;
    } catch (error) {
        return false;
    }
}

$(document).ready(async function() {
    isGetLocationSuccessful = await geoGetCurrentLocation();
    console.log(isGetLocationSuccessful);
    if (!isGetLocationSuccessful) {
        $("<div class='help-block'>Try allowing location services for NearMe or refreshing the page.</div>")
        .appendTo("#locationStatus");
    }

    $(":submit").click(function(event) {
        event.preventDefault(); //prevent the form from posting
        if (!isGetLocationSuccessful) {
            return;
        }
        $("#outletResults").html(""); //flush previously displayed results
        $(".form-inputs").removeClass("is-empty");
        $(".help-block").remove();

        if ($("#searchWord").val().length == 0) {
            $("#searchWord").addClass("is-empty");
            $("<div class='help-block'>Enter something to get started.</div>")
            .appendTo("#search-bar");
            return;
        }

        var params = {
            searchWord: $("#searchWord").val(),
            radius: $("#radiusSelect").val(),
            currentLatitude: currentLatitude,
            currentLongitude: currentLongitude
        };
        
        const url = "/outlets";
        $.getJSON(url, params, function(data) {
            var toDisplay = [], entry = [];
            toDisplay.push("<b>" + data.messageToUser + "</b><br></br>");
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