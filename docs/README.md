# NearMe

A simple web app that helps you find places near you in Singapore. Try it out [here](https://nearmesg.herokuapp.com) 🧭.

## Quick Links
* [For Users](#for-users)
  * [Using NearMe](#using-nearme)
  * [Enabling location services for NearMe](#enabling-location-services-for-nearme)
* [For Developers](#for-developers)
  * [Requirements](#requirements)
  * [Setup for local testing and development](#setup-for-local-testing-and-development)
  * [App constraints](#app-constraints)
* [FAQ](#faq)
* [Acknowledgements](#acknowledgements)

&nbsp;

##### Last updated: 8/9/2021

&nbsp;

----

## For Users


### Using NearMe

1. In the searchbar, type what you are looking for. This can be "supermarket", "fast food", "amenities", etc.

> 👉 NearMe is still under development. Please refer to the [FAQ](#faq) for a list of places the site currently supports.

2. Using the slider, choose the furthest distance you don't mind travelling.

3. Hit enter or click the search icon.

NearMe will show outlets of what you are looking for within this distance, up to 10 results. If there aren't any, NearMe will try to display the 5 nearest to you.

&nbsp;

### Enabling location services for NearMe</u>

NearMe only works if it knows your location. Due to its simplistic design, if the site is showing errors on getting your location, please try the following.

&nbsp;

**First steps**

* In the phone's or desktop's Settings, make sure location access is allowed for browsing.
*  Check your internet connection.
*  Refresh the page.
* If prompted again to allow NearMe to access your location, choose "Allow".
* Exit the site. Clear browser history for NearMe and visit the site again. The previous step should now be available.

&nbsp;

**Next steps if the above still don't work**

For browsers such as Chrome and Firefox:

1. In the browser, go to Settings > Site settings > Location.
2. Ensure that location access is turned on for NearMe.
> 👉 Keywords: "Ask first", "Ask", "Allowed", "Allow", "Always", "Site can ask for your location", "Allowed to see your location", etc.
>
3. Add NearMe to the list of "Allowed" sites.

For browsers such as Safari:



&nbsp;

----

## For Developers

### Requirements

1. Fork and clone this repo.
2. [Install Node.js](https://nodejs.org/en/download/) which comes with npm.
3. Check that both Node.js and npm are installed with the commands `node -v` and `npm -v`.
4. Ensure you have a DBMS installed. This will be used to set up the database for storing and using the web-scraped data (next few steps).


&nbsp;

### Setup for local testing and development

Before testing and developing locally, please set up the database locally in the following way.

1. Configure your environment variables in the `env.example` file. Delete the current `.env` file and replace with this file, renamed to `.env`.

2. To connect to and create a new MySQL database:
  
    `npm run db:create`

3. To build the relational database schema:
  
    `npm run db:setup`

4. To fill the relations with sample data scraped from [these sites](#faq) (this step should take a while):

    `npm run db:populate`

5. Finally, to start up the app:

    `npm run dev`

6. NearMe should be up and running by now. Enter `localhost:3000` in your browser to test it out.

![NearMe dev page](docs/nearme-dev-page.PNG)

&nbsp;

### Notes

* See `package.json` for all built-in scripts and their CLI commands.
* The `sample` folder contains snapshots of source scripts taken from the websites used to generate the sample data.

&nbsp;

### App constraints

* Limited functionality
  * Very small data set of 3 brands to search from.
  * Small, fixed array of keywords associated with each brand.
* Not scalable
  * The web app is using a custom parser for each website scraped, due to differences in where needed data is located in each website’s resources (html doc/JSON object/etc.). Each parser is an instance of the Parser class.

&nbsp;

----

## FAQ

1. What is there to search?
* [McDonald's](https://www.mcdonalds.com.sg/locate-us/) (keywords such as "macs", "burger", "fast food")
* [KFC](https://www.kfc.com.sg/Location/Search) (keywords such as "Kentucky", "fried chicken", "restaurant")
* [Fairprice](https://www.fairprice.com.sg/store-locator) (keywords such as "NTUC", "groceries", "amenities")

2. What information of mine does this site save?

    Only your location. The site does not use any cookies, nor does it remember any of your previous searches or visits (though this will be useful for a future feature; stay tuned!).

&nbsp;

----

## Acknowledgements

### Special Thanks
* To my mentor, [Michael Cheng](https://github.com/miccheng), as part of the GovTech Girls In Tech Summer Mentorship Programme 2021.

&nbsp;

### UI design/Front-end
* Done primarily using [Bulma](https://bulma.io/)
* General
  * Logo: Google Font's PT Sans Narrow Bold 700
  * [Brown paper background](https://unsplash.com/photos/Y3vPEuNlf7w)
  * [Box shadow](https://getcssscan.com/css-box-shadow-examples)
* Search page
  * [Footprints](https://monophy.com/gifs/marauders-footsteps-fustapfen-slPSVv0rNDe5GSLTlN)
* Results page
  * [Taped up notes](https://codepen.io/aitchiss/pen/QWKmPqx)
  * [Yellow note background](https://www.psdgraphics.com/textures/yellow-paper-texture/)
  * [White note background](https://www.freepik.com/free-photo/white-paper-texture_1033849.htm)
  * [Back to top button](https://mdbootstrap.com/docs/standard/extended/back-to-top/)
