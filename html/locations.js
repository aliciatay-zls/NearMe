let currentLatitude = null;
let currentLongitude = null;

function geoGetCurrentLocation() {
    const status = document.querySelector("#locationStatus");

    function success(pos) {
        currentLatitude = pos.coords.latitude;
        currentLongitude = pos.coords.longitude;
        status.textContent += currentLatitude + " " + currentLongitude;
    }

    function error() {
        status.textContent += "Error (unable to retrieve)";
    }

    if (!navigator.geolocation) {
        status.textContent += "Error (geolocation not supported)";
    } else {
        console.log('Trying to get location');
        navigator.geolocation.getCurrentPosition(success, error);
    }
}

var updateSearchOptions = function() {
    if ($("#brandSelect").val() == "") {
        $("#categorySelect").prop("disabled", false);
    } else {
        $("#categorySelect").prop("disabled", "disabled");
    }
    if ($("#categorySelect").val() == "") {
        $("#brandSelect").prop("disabled", false);
    } else {
        $("#brandSelect").prop("disabled", "disabled");
    }
}
    
$(updateSearchOptions);
$("#brandSelect").change(updateSearchOptions);
$("#categorySelect").change(updateSearchOptions);

$(document).ready(function() {
    geoGetCurrentLocation();

    $(":submit").click(function(event) {
        event.preventDefault(); //prevent the form from posting
        $("#outletResults").html(""); //flush previously displayed results

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
            if (data.outlets.length != 0) {
                $.each(data.outlets, function(key, val) {
                    entry.push("<li id='", key, "'>", val.name, "</li>",
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
            }
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