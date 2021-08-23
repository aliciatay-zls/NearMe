# NearMe

A simple web app that helps you find places near you in Singapore. Try it out [here](https://nearmesg.herokuapp.com) 🧭.

## Quick Links
* For Users
  * Using NearMe
  * Enabling location services for NearMe
* For Developers
  * Requirements
  * Setup for local testing and development
  * App constraints
* FAQ
* Acknowledgements

&nbsp;

##### Last updated: 24 Aug 2021

&nbsp;

----

## For Users


### Using NearMe

1. In the searchbar, type the keyword of where you want to go. This can be "supermarket", "fast food", "amenities", etc.
* _NearMe is still under development. Please refer to the FAQ for a list of keywords and places the site currently supports._

2. Using the slider, choose the furthest distance you wouldn't mind travelling.

3. Hit enter or click the search icon and NearMe will show you outlets that match this keyword and are within this distance, up to 10 results. If there aren't any nearby, NearMe will try to display the 5 nearest to you.

&nbsp;

### Enabling location services for NearMe</u>

NearMe only works if it knows your location. Please help it out if the site is showing errors on getting your location 🥺.

&nbsp;

If you're using a desktop browser such as Chrome or Firefox:

&nbsp;

If you're on your phone:

&nbsp;

----

## For Developers

### Requirements

1. Fork and clone [this repo](https://github.com/aliciatay-zls/NearMe).
2. 


&nbsp;

### Setup for local testing and development

Before testing and developing locally, please set up the database locally in the following way.

1. Configure your environment variables in the `env.example` file. Delete the current `.env` file and replace with this file, renamed to `.env`.

2. To connect to and create a new MySQL database:
  
    `npm run db:create`

3. To build the relational database schema:
  
    `npm run db:setup`

4. To fill the relations with sample data scraped from [these sites]() (this should take a while):

    `npm run db:populate`

5. Finally, to start up the app:

    `npm run dev`

6. NearMe should be up and running by now. Enter `localhost:3000` in your browser to test it out.

&nbsp;

Notes:

* See `package.json` for the full list of built-in scripts and their CLI commands.
* The `sample` folder contains snapshots of the source scripts of the sample data used.

&nbsp;

### App constraints

&nbsp;

----

## FAQ

&nbsp;

----

## Acknowledgements
