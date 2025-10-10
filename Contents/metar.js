//  ||
//===========================================================================
// Steampunk weather widget 3.0.1
// Inspired by: Bogdan Irimia (bogdan@digitair.ro) whose digistation widget was the original source of inspiration.
// Steampunked by: Dean Beedell with serious code suggestions by Harry Whitfield (original code by Bogdan Irimia now 95% replaced)
// Dean.beedell@lightquick.co.uk
//
// metar.js - include for specific weather feed functions related to this feed source - https://aviationweather.gov
//
//===========================================================================

//======================================================================================
// Function to set the location
//======================================================================================
imgBtnSearch.onClick = function() {
       testLocation();
};
//=====================
//End function
//=====================

//======================================================================================
// Function to rotate the previous pressure recording pointer to new value
//======================================================================================
ac_manual.onClick = function() {
    setManual(presiune, preferences.animationpref.value);
};
//=====================
//End function
//=====================

//======================================================================================
// Search Location - function to get a new location
//======================================================================================
slider.onclick = function() {
    knob2onClick();
};
//=====================
//End function
//=====================

//======================================================================================
// Search Location - function to get a new location
//======================================================================================
knob2.onClick = function() {
    knob2onClick();
};
//=====================
//End function
//=====================



//======================================================================================
// Search Location - function to close the search window
//======================================================================================
btn_cancel.onClick = function() {
    //searchWindow.visible = false;
    fadeSearchWindow(); // starts the fade timer
};
//=====================
//End function
//=====================

//======================================================================================
// Search Location - function to handle a change of location
//======================================================================================
imgCmbResults.onMouseDown = function() { // was onClick
    changeLoc();
};
//=====================
//End function
//=====================

//======================================================================================
// Search Location - function to handle a change of location
//======================================================================================
txt_results.onMouseDown = function() { // was onClick
    changeLoc();
};
//=====================
//End function
//=====================

//======================================================================================
// Search Location - function to OK the change in location
//======================================================================================
btn_ok.onClick = function() {
    if (preferences.soundpref.value === "enable") {
        play(buzzer, false);
    }
    if (txt_results.data == "" )
    {
        testLocation();
    } else {

        saveLoc(txt_search.data);
        btn_ok.visible = false;
        btn_pushed.visible = true;
        sleep(500);
        btn_ok.visible = true;
        btn_pushed.visible = false;
        sleep(1000);
        txtSearching.data = "";
        //searchWindow.visible = false;
        fadeSearchWindow();
    }
    //
};
//=====================
//End function
//=====================


//======================================================================================
// Search Location - function to handle each keypress on the text search field
//======================================================================================
txt_search.onKeyPress = function() {
    // if the input is a location then handle it
    if (preferences.metarpref.value === "location") {

        if ((system.event.keyString === "Return") || (system.event.keyString === "Enter")) {
            txt_search.rejectKeyPress();
            var ee =  txt_search.data;
            txt_search.data = ee.replace(/\s/g,'');
            //txt_search.data = ee.trim();  //trim is not implemented
            if (txt_search.data != "") {   // no empty strings
                    if (debug == 1) { print("%txt_search - calling testLocation")};
                    testLocation();
            }
        } else {
            var key = system.event.key;
            if ((key >= "a") && (key <= "z")) {
                txt_search.rejectKeyPress();
                txt_search.replaceSelection(key.toUpperCase());
            }
        }
    }
    // if the input is an icao then handle it
    if (preferences.metarpref.value === "icao") {
              if ((system.event.keyString === "Backspace") ) {
                     keyPressCount -= 1 ;
                     return;
               } else if ((system.event.keyString === "Return") || (system.event.keyString === "Enter")) {
                    //shorten the input to 4 characters if cut /pasted in with too many characters
                    var ff = txt_search.data;
                    if (ff.length > 4) {
                        var gg = txt_search.data;
                        txt_search.data = gg.substring(0,4);
                        var answer = alert("Valid ICAO codes are only four digits long. Use the top sliding switch to select a city search.");
                        if (debug == 1) { print("%txt_search - txt_search.data "+ txt_search.data)};
                    };
                    var ee =  txt_search.data;
                    txt_search.data = ee.replace(/\s/g,'');
                    //txt_search.data = ee.trim();  //trim is not implemented
                    if (txt_search.data != "") {   // no empty strings
                            if (debug == 1) { print("%txt_search - calling testLocation")};
                            testLocation();
                    }
               } else {
                      var key = system.event.key;
                      if ((key >= "a") && (key <= "z")) {
                          txt_search.rejectKeyPress();
                          txt_search.replaceSelection(key.toUpperCase());
                      }
                      keyPressCount += 1 ;
               }

               if (debug == 1) { print("%txt_search - keyPressCount "+ keyPressCount)};
               if (keyPressCount > 4 ) {
                      //if the station id returned is null then assume the weather information is missing for an unknown reason.
                      txtSearching.data = "Use top switch for city.";
                      var answer = alert("Valid ICAO codes are only four digits long. Use the top sliding switch to select a city search.");
                      txt_search.focus();
               }
    }
};
//=====================
//End function
//=====================

//=====================================================================================
// this function is where we come to when an ICAO code is found and data returned
// a successful http request brings you here.
//=====================================================================================
function myStatusProc() {
    var vals,
        returnedXML,
        vals0,
        theDate,
        secsDif,
        difString,
        returnedString;
        theDate = new Date();
    if (debug == 1) { print("%myStatusProc - this.readyState "+ this.readyState)};
    if (this.readyState === 4) { // asynchronous xml request complete
        if (debug == 1) { print("%myStatusProc:status: " + this.status)};
        if (this.status === 200) {
            // start the busy timer animation
            busyTimer.ticking=true;
            // return as XML
            returnedXML = this.responseXML;
            // return as string - this is only for debug logging
            returnedString = this.responseText.split(">");
            if (debug == 1) { print("%myStatusProc - returnedString: " + returnedString.toString())};

            // get the values from the XML data response, the num results should be non-zero
            var data1 = returnedXML.evaluate("string(response/data)");
            var num_results = returnedXML.evaluate("string(response/data/attribute::num_results)");
            if (debug == 1) { print ("%myStatusProc - num_results "+ num_results)};

            //num_results = 0;

            if (num_results == 0 && preferences.alertPref.value == "enabled") {
              //The source weather feed is currently producing no valid data.
              alert(bf('_alertstr9')+ (parseInt(preferences.intervalValuePref.value/60)) + " mins.");
              return;
            }

            // get the values from the XML data and return strings - the easy stuff first
            var observation_time = returnedXML.evaluate("string(response/data/METAR/observation_time)");
            if (debug == 1) { print ("%myStatusProc - observation_time "+ observation_time)};
            var station_id = returnedXML.evaluate("string(response/data/METAR/station_id)");
            if (debug == 1) { print ("%myStatusProc - station_id "+ station_id)};
            var temp_c = parseInt(returnedXML.evaluate("string(response/data/METAR/temp_c)"));
            if (debug == 1) { print ("%myStatusProc - temp_c "+ temp_c)};
            var altim_in_hg = returnedXML.evaluate("string(response/data/METAR/altim_in_hg)");
            if (debug == 1) { print ("%myStatusProc - altim_in_hg "+ altim_in_hg)};
            var dewpoint_c = parseInt(returnedXML.evaluate("string(response/data/METAR/dewpoint_c)"));
            if (debug == 1) { print ("%myStatusProc - dewpoint_c "+ dewpoint_c)};
            wind_dir_degrees = returnedXML.evaluate("string(response/data/METAR/wind_dir_degrees)");
            if (debug == 1) { print ("%myStatusProc - wind_dir_degrees "+ wind_dir_degrees)};
            var wind_speed_kt = returnedXML.evaluate("string(response/data/METAR/wind_speed_kt)");
            if (debug == 1) { print ("%myStatusProc - wind_speed_kt "+ wind_speed_kt)};

            var latitude = returnedXML.evaluate("string(response/data/METAR/latitude)");
            if (debug == 1) { print ("%myStatusProc - latitude "+ latitude)};
            var longitude = returnedXML.evaluate("string(response/data/METAR/longitude)");
            if (debug == 1) { print ("%myStatusProc - longitude "+ longitude)};

            var wx_string = returnedXML.evaluate("string(response/data/METAR/wx_string)");
            if (debug == 1) { print ("%myStatusProc - wx_string "+ wx_string)};

            var precip_in = returnedXML.evaluate("string(response/data/METAR/precip_in)");
            if (debug == 1) { print ("%myStatusProc - precip_in "+ precip_in)};

            var visibility_statute_mi = returnedXML.evaluate("string(response/data/METAR/visibility_statute_mi)");
            if (debug == 1) { print ("%myStatusProc - visibility_statute_mi "+ visibility_statute_mi)}

            // this is the routine that will determine if there is more than one sky attribute
            var metar_items = returnedXML.evaluate("/response/data/METAR"); //read in the metar data into an array
	    var current_node = metar_items.item(0);	// this gets <METAR> group where the metar data resides
            var sky_condition_items = current_node.evaluate("sky_condition"); //get the sky_condition from the METAR group

            var cloud_base_ft_agl = new Array();
            var sky_cover = new Array();  // this should clear the array each time it is called.
            var counter = 0;

	    if (sky_condition_items != null) {
		while (counter < sky_condition_items.length) {
                        current_node = sky_condition_items.item(counter);
                        sky_cover[counter] = current_node.evaluate("string(attribute::" + "sky_cover" + ")");
                        cloud_base_ft_agl[counter] = current_node.evaluate("string(attribute::" + "cloud_base_ft_agl" + ")");
                        counter = counter + 1;
		}
	    }
            //the first and lowest cloudbase is the one that really counts, there could be as many as three sky cover readings
            if (debug == 1) { print ("%myStatusProc - sky_cover 1 "+ sky_cover[0])};
            if (debug == 1) { print ("%myStatusProc - cloud_base_ft_agl 1 "+ cloud_base_ft_agl[0])};
            if (debug == 1 && sky_cover[1] != undefined) { print ("%myStatusProc - sky_cover 2 "+ sky_cover[1])};
            if (debug == 1 && sky_cover[1] != undefined) { print ("%myStatusProc - cloud_base_ft_agl 2 "+ cloud_base_ft_agl[1])};

            //if the station id returned is null then assume the weather information is missing for an unknown reason.
            if (station_id == "") {
                if (debug == 1) { print ("%myStatusProc - missing station_id ")};
                var answer = alert("Rather weird - The supplied ICAO code " + preferences.icao.value + " does not seem to providing any valid data, please select another.");
                if (answer === 1) {
                  searchWindowVisible();
                }
            }

            // get pressure
            pressureVal= altim_in_hg * 25.3999;
            vals0 = Number(pressureVal);
            pressureVal = Math.round(vals0);
            setPres(pressureVal, preferences.animationpref.value);
            pressureVal = String(pressureVal) + "(" + String(Math.round(1.3333 * vals0)) + ")";
            if (debug == 1) { print ("%myStatusProc - Pressure = "+ pressureVal)};
            setManual(preferences.lastPres.value, preferences.animationpref.value);

            // rotate the outer hand to show the data has just been captured
            rotateHand();

            // set temperature
            temperatureVal= temp_c ;
            setTemp(Number(temperatureVal));

            //calculate humidity
            var humidity = Math.round(100 * Math.pow((112 - (0.1 * temp_c ) + dewpoint_c) / (112 + (0.9 * temp_c )), 8));
            if (debug == 1) { print ("%myStatusProc - humidity "+ humidity)};
            humidityVal= humidity;
            setHumidityPointer(Number(humidityVal), true);
            
            skyClarity ="";
            skyClarityString= "";
            //decode the visibility when a cloud cover field found
            skyClarity = get_cloud_cover(sky_cover);
            if (cloud_base_ft_agl != 0) {
                if (preferences.imperialMetricPref.value === "metric") {
                    // change the string to metric measurements
                    var cloud_base_mt_agl = parseInt(cloud_base_ft_agl * 0.3048 );
                    skyClarityString = skyClarity + " at " + cloud_base_mt_agl + " metres.";
                } else {
                    skyClarityString = skyClarity + " at " + cloud_base_ft_agl + " ft.";
                }
            }
            if (debug == 1) { print("%myStatusProc - skyClarityString " + skyClarityString)};



            // get the current decimalTime and use it to test for sunrise or sunset
            var locationDayNight = new SunriseSunset(theDate.getYear(), theDate.getMonth(), theDate.getDay(), latitude , longitude  );
            var decimalTime = theDate.getHours() + ( theDate.getMinutes()/ 60) ;
            if (debug == 1) { print ("%myStatusProc - decimalTime "+ decimalTime)};
            var isDay = locationDayNight.isDaylight(decimalTime);
            if (debug == 1) { print("%myStatusProc - daylight " + isDay)};

            //wx_string = "+FG"; //testing string

            // set the general weather conditions into the icon displayed
            determineWeatherConditionIcon(wx_string, sky_cover, isDay);

            // get the observation time string
            var initialObsTime = observation_time.substr(0,10) + " " + observation_time.substr(11,8);
            usableObsTime = stringToDate(initialObsTime);

            //set the mini clock to show the observation time
            theClock.displayTime(usableObsTime);

            // get the current time string and compare
            theDate = new Date();
            secsDif = parseInt(theDate.getTime() / 1000, 10) - parseInt(usableObsTime.getTime() / 1000, 10);

            // format the interval for display in the tooltip
            difString = nice_format_interval(secsDif);
            preferences.lastUpdated.value = usableObsTime.getTime();
            if (debug == 1) { print("%myStatusProc - difString " + difString)};

            bk.Tooltip = " ";
            // set the hover over tooltips
            setHoverTooltip(wind_dir_degrees, wind_speed_kt, precip_in, difString, wx_string);

            setIconTooltip(wx_string, sky_cover);

            set_the_pointer();

            // buildVitality call in kon file
            gCity = icaoLocation5+ " "+ icaoLocation1;
            gTemp = temperatureVal;
            if (gCity && gTemp) {
                buildVitality("vitality.png", icon, gCity, gTemp, "\u00B0");
            }
            busyStop();
        } else {
            // Cannot connect
             if (preferences.alertPref.value == "enabled") {
              //The source weather feed is currently producing no valid data.
              alert(bf('_alertstr9')+ (parseInt(preferences.intervalValuePref.value/60)) + " mins.");
              return;
            }

        }
    }


}
//=====================
//End function
//=====================

//=====================================================================================
// this function is where we come to when an ICAO code is found and data returned
// a successful http request brings you here.
//=====================================================================================
function tafStatusProc() {
    var vals,
        returnedXML,
        vals0,
        theDate,
        secsDif,
        difString,
        returnedString;
        theDate = new Date();
    if (debug == 1) { print("%tafStatusProc - this.readyState "+ this.readyState)};
    if (this.readyState === 4) { // asynchronous xml request complete
        if (debug == 1) { print("%tafStatusProc:status: " + this.status)};
        if (this.status === 200) {
            // start the busy timer animation
            busyTimer.ticking=true;
            // return as XML
            returnedXML = this.responseXML;
            // return as string - this is only for debug logging
            returnedString = this.responseText.split(">");
            if (debug == 1) { print("%tafStatusProc - returnedString: " + returnedString.toString())};

            // get the values from the XML data response, the num results should be non-zero
            var data1 = returnedXML.evaluate("string(response/data)");
            var num_results = returnedXML.evaluate("string(response/data/attribute::num_results)");
            if (debug == 1) { print ("%tafStatusProc - num_results "+ num_results)};

            //num_results = 0;

            if (num_results == 0 && preferences.alertPref.value == "enabled") {
              //The source weather feed is currently producing no valid data.
              alert(bf('_alertstr9')+ (parseInt(preferences.intervalValuePref.value/60)) + " mins.");
              return;
            }

            // get the values from the XML data and return strings - the easy stuff first
            var station_id = returnedXML.evaluate("string(response/data/TAF/station_id)");
            if (debug == 1) { print ("%tafStatusProc - station_id "+ station_id)};

            var latitude = returnedXML.evaluate("string(response/data/TAF/latitude)");
            if (debug == 1) { print ("%tafStatusProc - latitude "+ latitude)};
            var longitude = returnedXML.evaluate("string(response/data/TAF/longitude)");
            if (debug == 1) { print ("%tafStatusProc - longitude "+ longitude)};

            var temp_c = returnedXML.evaluate("string(response/data/TAF/forecast/temp_c)");
            if (debug == 1) { print ("%tafStatusProc - temp_c "+ temp_c)};

            var fcst_time_from = returnedXML.evaluate("string(response/data/TAF/forecast/fcst_time_from)");
            if (debug == 1) { print ("%tafStatusProc - fcst_time_from "+ fcst_time_from)};

            var fcst_time_to = returnedXML.evaluate("string(response/data/TAF/forecast/fcst_time_to)");
            if (debug == 1) { print ("%tafStatusProc - fcst_time_to "+ fcst_time_to)};

            var wx_string = returnedXML.evaluate("string(response/data/TAF/forecast/wx_string)");
            if (debug == 1) { print ("%tafStatusProc - wx_string "+ wx_string)};

            var wind_dir_degrees = returnedXML.evaluate("string(response/data/TAF/forecast/wind_dir_degrees)");
            if (debug == 1) { print ("%tafStatusProc - wind_dir_degrees "+ wind_dir_degrees)};

            var wind_speed_kt = returnedXML.evaluate("string(response/data/TAF/forecast/wind_speed_kt)");
            if (debug == 1) { print ("%tafStatusProc - wind_speed_kt "+ wind_speed_kt)};

            var visibility_statute_mi = returnedXML.evaluate("string(response/data/TAF/forecast/visibility_statute_mi)");
            if (debug == 1) { print ("%tafStatusProc - visibility_statute_mi "+ visibility_statute_mi)}

            // this is the routine that will determine if there is more than one sky attribute
            var taf_items = returnedXML.evaluate("/response/data/TAF/forecast"); //read in the taf data into an array
	    var current_node = taf_items.item(0);	// this gets <TAF> group where the taf data resides
            var sky_condition_items = current_node.evaluate("sky_condition"); //get the sky_condition from the TAF group

            var cloud_base_ft_agl = new Array();
            var sky_cover = new Array();  // this should clear the array each time it is called.
            var counter = 0;

	    if (sky_condition_items != null) {
               //if (debug == 1) { print ("%tafStatusProc - HERE ")};

		while (counter < sky_condition_items.length) {
                        current_node = sky_condition_items.item(counter);
                        sky_cover[counter] = current_node.evaluate("string(attribute::" + "sky_cover" + ")");
                        cloud_base_ft_agl[counter] = current_node.evaluate("string(attribute::" + "cloud_base_ft_agl" + ")");
                        counter = counter + 1;
		}
	    }
            //the first and lowest cloudbase is the one that really counts, there could be as many as three sky cover readings
            if (debug == 1) { print ("%tafStatusProc - sky_cover 1 "+ sky_cover[0])};
            if (debug == 1) { print ("%tafStatusProc - cloud_base_ft_agl 1 "+ cloud_base_ft_agl[0])};
            if (debug == 1 && sky_cover[1] != undefined) { print ("%tafStatusProc - sky_cover 2 "+ sky_cover[1])};
            if (debug == 1 && sky_cover[1] != undefined) { print ("%tafStatusProc - cloud_base_ft_agl 2 "+ cloud_base_ft_agl[1])};

            //if the station id returned is null then assume the weather information is missing for an unknown reason.
            if (station_id == "") {
                if (debug == 1) { print ("%tafStatusProc - missing station_id ")};
                var answer = alert("Rather weird - The supplied ICAO code " + preferences.icao.value + " does not seem to providing any valid data, please select another.");
                if (answer === 1) {
                  searchWindowVisible();
                }
            }

            // get the current decimalTime and use it to test for sunrise or sunset
            var locationDayNight = new SunriseSunset(theDate.getYear(), theDate.getMonth(), theDate.getDay(), latitude , longitude  );
            var decimalTime = theDate.getHours() + ( theDate.getMinutes()/ 60) ;
            if (debug == 1) { print ("%tafStatusProc - decimalTime "+ decimalTime)};
            var isDay = locationDayNight.isDaylight(decimalTime);
            if (debug == 1) { print("%tafStatusProc - daylight " + isDay)};

            // set the general weather conditions into the icon displayed
            determineWeatherConditionIcon(wx_string, sky_cover, isDay);

            // get the observation time string
            var initialObsTime = fcst_time_from.substr(0,10) + " " + fcst_time_from.substr(11,8);
            usableObsTime = stringToDate(initialObsTime);
            if (debug == 1) { print ("%tafStatusProc - usableObsTime "+ usableObsTime)}

            busyStop();
        } else {
            // Cannot connect
             if (preferences.alertPref.value == "enabled") {
              //The source weather feed is currently producing no valid data.
              alert(bf('_alertstr9')+ (parseInt(preferences.intervalValuePref.value/60)) + " mins.");
              return;
            }
        }
    }


}
//=====================
//End function
//=====================

//=================================================
// this function gets data from the chosen location
//=================================================
function getData(loc) {
    //called from the startup routine
    if (debug == 1) { print("%getData - Getting data... from aviationweather.gov/adds/.../stationstring=" + loc)};
    var request = new XMLHttpRequest();        // an asynchronous request
    analysisType = "METAR";
    analysisType2 = "";
    request.onreadystatechange = myStatusProc;
    if (debug == 1) { print("%getData - location " + loc)};
    request.open("GET", "https://aviationweather.gov/api/data/metar?ids=" + loc + "&hours=6&order=id%2C-obs&sep=true&format=xml&mostRecent=true", "true");

    if (debug == 1) { print("%getData - https://aviationweather.gov/api/data/metar?ids=" + loc + "&hours=6&order=id%2C-obs&sep=true&format=xml&mostRecent=true")};
	
    request.timeout = 10;
    request.send();
}
//=====================
//End function
//=====================


//=================================================
// this function gets TAF data from the chosen location
//=================================================
function getTafData(loc) {
    //called on startup in the .kon file
    if (debug == 1) { print("%getTafData - Getting TAF data... from aviationweather.gov/adds/.../stationstring=" + loc)};
    var request = new XMLHttpRequest();        // an asynchronous request
    analysisType = "TAF";
    analysisType2 = "forecast";
    request.onreadystatechange = tafStatusProc;
    if (debug == 1) { print("%getTafData - location " + loc)};
    request.open("GET", "https://aviationweather.gov/api/data/metar?ids=" + loc + "&startTime=2023-10-16T14:11:15Z&endTime=2023-10-16T16:11:15Z&sep=true&format=xml&mostRecent=true", "true");
    
	if (debug == 1) { print("%getTafData - https://aviationweather.gov/api/data/metar?ids=" + loc + "&hours=6&order=id%2C-obs&sep=true&format=xml&mostRecent=true")};

    request.timeout = 10;
    request.send();
}
//=====================
//End function
//=====================

//======================================================================
// this function determines what to do on a knob click icao or location?
//======================================================================
function knob2onClick() {
    txt_search.data = "";
    txt_results.data = "";
    if (preferences.soundpref.value === "enable") {
        play(clunk, false);
    }
    if (preferences.metarpref.value === "location") {
        preferences.metarpref.value = "icao";
        txtSearchCity.data = bf("_Search_ICAO") + " :";
        knob2.hOffset = 185;
    } else {
        preferences.metarpref.value = "location";
        txtSearchCity.data = bf("_Search_city") + ":";
        knob2.hOffset = 130;
    }
}
//=====================
//End function
//=====================

//=================================================
// searches the icao data file for a specific code
//=================================================
function searchIcaoFile(loc) {  // returns icaoData
    var icaoDataArray = filesystem.readFile( "Resources/icao_codes.dat", true ),
        i,
        def,
        fnd,
        map = {};
        lookFor = loc;
        
        txtSearching.data = "Getting the ICAO code " + loc;
        sleep(1500);

        if (debug == 1) { print ("searchIcaoFile - " + preferences.metarpref.value + " search started for " + lookFor)};

        for (i = 0; i < icaoDataArray.length; i += 1) {
            icaoDataArray[i] = icaoDataArray[i].toUpperCase();
            fnd = icaoDataArray[i].match(lookFor);
            if (fnd !== null) {
                var splitIcaoData = icaoDataArray[i].split(",");
                icaoLocation1 = (splitIcaoData[1].replace(/"/g, "")).toProperCase();   //
                //icaoLocation1 = icaoLocation1.toProperCase();
                if (debug == 1) { print ("%searchIcaoFile - icaoLocation1 "  + " = " + icaoLocation1)};

                icaoLocation2 = (splitIcaoData[2].replace(/"/g, "")).toProperCase();   // city
                if (debug == 1) { print ("%searchIcaoFile - icaoLocation2 "  + " = " + icaoLocation2)};

                icaoLocation3 = (splitIcaoData[3].replace(/"/g, "")).toProperCase();   // country
                if (debug == 1) { print ("%searchIcaoFile - icaoLocation3 " + " = " + icaoLocation3)};
  
                icaoLocation4 = splitIcaoData[4].replace(/"/g, "");   // airport code LHR
                if (debug == 1) { print ("%searchIcaoFile - icaoLocation4 "  + " = " + icaoLocation4)};
  
                icaoLocation5 = splitIcaoData[5].replace(/"/g, "");   // icao code

                if (icaoLocation5 == "\\N") {
                  icaoLocation5 = splitIcaoData[4].replace(/"/g, "");
                };   // use the IATA code as the ICAO code is missing}
                if (debug == 1) { print ("%searchIcaoFile - icaoLocation5 " + " = " + icaoLocation5)};

                retStr = icaoDataArray[i];
                preferences.icao.value = icaoLocation5;
                if (debug == 1) { print ("searchIcaoFile - found " + lookFor + " in " + retStr)};
                txtSearching.data = "Found ICAO code " + loc;

                sleep(1000);
                return (retStr);
            }
        }
        if (icaoLocation5 == "\\N") {
             var answer = alert("That city does not have a valid ICAO code assigned. \n It exists and has an IATA code, but that is of no use... \n Please select another location.");
        };

        if (fnd == null) {
            if (debug == 1) { print ("searchIcaoFile - lookFor not found " + lookFor)};
            txtSearching.data = "Failed to find ICAO code " + lookFor;
            preferences.icao.value = "";
            loc = "";
            return ("city not found");
        }
}
//==============================
//End function
//==============================

//=================================================
// searches the icao data file for a specific city match, if more than one found it will build an array of menu items to allow the user to select.
//=================================================
function searchCityFile(loc) {  // returns icaoData
    var icaoDataArray = filesystem.readFile( "Resources/icao_codes.dat", true ),
        i,
        j=0,
        def,
        fnd,
        map = {},
        lookFor = loc,
        foundCityFlg=false;
        var resultItems = new Array();
        var vals = new Array();
        txtSearching.data = "Getting the city " + loc;
        sleep(1500);

        if (debug == 1) { print ("searchCityFile "+preferences.metarpref.value + " search started for " + lookFor)};

        for (i = 0; i < icaoDataArray.length; i += 1) {
            icaoDataArray[i] = icaoDataArray[i].toUpperCase();
            fnd = icaoDataArray[i].match(lookFor);
            if (fnd !== null) {
                foundCityFlg = true;
                var splitIcaoData = icaoDataArray[i].split(",");
                icaoLocation1 = splitIcaoData[1].replace(/"/g, "");   //
                if (debug == 1) { print ("%searchCityFile - icaoLocation1 "  + " = " + icaoLocation1)};

                icaoLocation2 = splitIcaoData[2].replace(/"/g, "");   // city
                if (debug == 1) { print ("%searchCityFile - icaoLocation2 "  + " = " + icaoLocation2)};

                icaoLocation3 = splitIcaoData[3].replace(/"/g, "");   // country
                if (debug == 1) { print ("%searchCityFile - icaoLocation3 " + " = " + icaoLocation3)};

                icaoLocation4 = splitIcaoData[4].replace(/"/g, "");   // airport code LHR
                if (debug == 1) { print ("%searchCityFile - icaoLocation4 "  + " = " + icaoLocation4)};

                icaoLocation5 = splitIcaoData[5].replace(/"/g, "");   // icao code

                if (debug == 1) { print ("%searchCityFile - icaoLocation5 " + " = " + icaoLocation5)};

                preferences.icao.value = icaoLocation5;
                retStr = icaoDataArray[i];
                if (debug == 1) { print ("searchCityFile - found " + icaoLocation5 + " associated with " + lookFor + " in " + retStr)};
                txtSearching.data = "Found City " + loc;

                // Create City Menu

                j+=1;  //increment this counter each time a city match is found
                if (debug == 1) { print ("searchCityFile - building menu item " + j + " " + icaoLocation5 +  " " +icaoLocation1)};
                resultItems[j] = new MenuItem();
                resultItems[j].title = icaoLocation1 + ", " + icaoLocation2 + ", " + icaoLocation3 + ", " + icaoLocation5 ;
                // IMPORTANT : do NOT change the minimum supported widget version to 4.5 as it will stop the next line from working.
                // this feature allows the static icao value to be passed to the onselect function
                // rather than the new value of icaoLocation5 when the menu item is finally selected.
                resultItems[j].onSelect = "saveLoc('" + icaoLocation5 + "', \"" + icaoLocation1 + "\")";
                if (j === 0) {
                    saveLoc(icaoLocation5,icaoLocation1);
                }
            }
        }
        // if the city counter is greater than zero then show the popup menu we have built
        if (j > 0) {
                 popupMenu(resultItems, 15, btn_ok.vOffset - 10);
        }
        if (foundCityFlg === false) {
            if (debug == 1) { print ("searchCityFile - City not found " + lookFor)};
            txtSearching.data = bf("_city_not_found") + "! " + lookFor;
            preferences.icao.value = "";
            loc = "";
            return ("city not found");
        }
}
//==============================
//End function
//==============================

//===================================================
// this function loads the menu selected city location icao code into the icao prefs
//===================================================
function saveLoc(icao,title) {
    if (debug == 1) { print("%SaveLoc - icao " + icao)};
    if (debug == 1) { print("%SaveLoc - title " + title)};
    txt_results.data = title;

    if (icao == "N") {
           var answer = alert("That city does not have a valid ICAO code assigned. \n It exists and has an IATA code, but that is of no use... \n Please select another location.");
           return;
    };

    if (icao) {
        preferences.icao.value = icao;
    }

    txtSearchCity.data = bf("_Search_city") + ":";
    preferences.metarpref.value == "icao";
}
//=====================
//End function
//=====================


//=====================================================================================
// this function takes the input ICAO code or location and tests it against a list of known codes
// if it is valid it then initiates a new http request.
//=====================================================================================
function testLocation() {
        if (txt_search.data !== "") {
            txtSearching.data = bf("_searching") + "...";
               var checkIcao = "";
               if (debug == 1) { print("%testLocation " + preferences.metarpref.value)};

               // test a code or city name
               if (preferences.metarpref.value === "icao") {
                   checkIcao = searchIcaoFile(txt_search.data);
               } else {
                   checkCity = searchCityFile(txt_search.data);
               }

               // now get the data from the metar server
                   print("%testLocation checkIcao "+ checkIcao);
                   print("%testLocation preferences.icao.value "+ preferences.icao.value);

               if (checkIcao != "city not found" || preferences.icao.value != "") {
                   print("%testLocation checkIcao "+ checkIcao);
                   icaoData = checkIcao;
                   if (preferences.foreCastType.value == "metar") {
                      getData(preferences.icao.value);
                   } else {
                      getTafData(preferences.icao.value);
                   }
                   sleep(1000);
                   txtSearching.data = "";
                   if (searchWindow.visible == true) {
                      fadeSearchWindow(); // starts the fade timer
                   }
               } else {
                   sleep(2000);
                   txtSearching.data = "Type a valid ICAO code (EGKK).";
               }
        } else {
            if (preferences.metarpref.value === "location") {
                   alert(Bf("_Please_enter_the_name_of_your_desired_city_first") + "!");
            } else {
                   alert(bf("_Please_enter_the_name_of_your_desired_icao_first") + "!");
            }
        }
}
//=====================
//End function
//=====================

//===========================================
// this function starts to get the location
//===========================================
function changeLoc() {
    popupMenu(resultItems, 15, system.event.vOffset - 10);
}
//=====================
//End function
//=====================

//===========================================
// this function returns a translated string
//===========================================
function bf(s) { // for localization of strings
    //print(useAlternative);
    if (useAlternative) {
        return ro[s];
    }
    s = widget.getLocalizedString(s);
    return uc ? s.toUpperCase() : s;
}
//=====================
//End function
//=====================

//===========================================
// this function sets the hover over tooltip
//===========================================
function setHoverTooltip(wind_dir_degrees, wind_speed_kt, precip_in, difString,wx_string) {
            //precip_in = 0.2; for testing

            compassDirection=degToCompass(wind_dir_degrees);
            if (debug == 1) { print("%setHoverTooltip compassDirection " + compassDirection)};
            if (debug == 1) { print("%setHoverTooltip " + skyClarityString)};
            var force = beaufortConversion(wind_speed_kt);

            bk.Tooltip =  " "  + usableObsTime + " "  + "\n " + preferences.icao.value + " ";

            if (preferences.tempUnit.value === "F") {
                temperatureVal = temperatureVal * 1.8 + 32;
                bk.Tooltip += icaoLocation1 + ", " + icaoLocation2 + ", " + icaoLocation3+" "  + "\n " + bf('_Pressure') + ": " + pressureVal + " mmHg(mbar)\n " + bf('_Temperature') + ": " + Math.round(temperatureVal).toFixed(2) + " F\n " + bf('_Humidity') + ": " + humidityVal + " % "   + "\n " +  skyClarityString  + "\n " + bf("_wind_speed_is") + " " + wind_speed_kt + " knots, " + bf("_strength_force") + " " + force + ", " + bf("_direction") + " " + compassDirection;
            } else {
                bk.Tooltip += icaoLocation1 + ", " + icaoLocation2 + ", " + icaoLocation3+" "  + "\n " + bf('_Pressure') + ": " + pressureVal + " mmHg(mbar)\n " + bf('_Temperature') + ": " + Math.round(temperatureVal).toFixed(2) + " C\n " + bf('_Humidity') + ": " + humidityVal + " % "   + "\n " +  skyClarityString  + "\n " + bf("_wind_speed_is") + " "  + wind_speed_kt + " knots, " + bf("_strength_force") + " " + force + ", " + bf("_direction") + " " + compassDirection;
            }
            if (precip_in != 0) {
                bk.Tooltip += "\n " + bf("_precipitation_is") + " " + precip_in + " inches";
            }

            var wx_str = getMetarDescription(wx_string);    // get the interpreted wx string data
            if (wx_str != "" ) {
              bk.Tooltip  += " \n " + wx_str +" \n "  ;
            }
            tooltipText.data = String(bk.Tooltip);

            // save the tooltip value so it can be used during the regular timed 60 second tooltip updates.
            preferences.lastTooltip.value = bk.Tooltip;
            bk.Tooltip += " \n" + difString;
            bk.Tooltip += " \n " + bf("_Double_tap_on_me_to_get_new_weather");
 }
//=====================
//End function
//=====================

//=====================================================================================
//  function to decode_weather when a wx field found and set the icon accordingly
//=====================================================================================
function determineWeatherConditionIcon(wx_string, sky_cover, isDay){
   // wx_string = "+PRFG"; //testing string

   var wSeverity="";
   var wModifier="";
   var skycover1="";
   var skycover2="";
   var skycover3="";

    if (sky_cover[0] == "SKC") {skycover1 = "SKC"};
    if (sky_cover[1] == "SKC") {skycover2 = "SKC"};
    if (sky_cover[2] == "SKC") {skycover3 = "SKC"};
    if (sky_cover[0] == "CLR") {skycover1 = "CLR"};
    if (sky_cover[1] == "CLR") {skycover2 = "CLR"};
    if (sky_cover[2] == "CLR") {skycover3 = "CLR"};
    if (sky_cover[0] == "FEW") {skycover1 = "FEW"};
    if (sky_cover[1] == "FEW") {skycover2 = "FEW"};
    if (sky_cover[2] == "FEW") {skycover3 = "FEW"};
    if (sky_cover[0] == "SCT") {skycover1 = "SCT"};
    if (sky_cover[1] == "SCT") {skycover2 = "SCT"};
    if (sky_cover[2] == "SCT") {skycover3 = "SCT"};
    if (sky_cover[0] == "BKN") {skycover1 = "BKN"};
    if (sky_cover[1] == "BKN") {skycover2 = "BKN"};
    if (sky_cover[2] == "BKN") {skycover3 = "BKN"};
    if (sky_cover[0] == "OVC") {skycover1 = "OVC"};
    if (sky_cover[1] == "OVC") {skycover2 = "OVC"};
    if (sky_cover[2] == "OVC") {skycover3 = "OVC"};
    if (sky_cover[0] == "VV ") {skycover1 = "VV "};
    if (sky_cover[1] == "VV ") {skycover2 = "VV "};
    if (sky_cover[2] == "VV ") {skycover3 = "VV "};
    if (sky_cover[0] == "CAVOK") {skycover1 = "CAVOK"};
    if (sky_cover[1] == "CAVOK") {skycover2 = "CAVOK"};
    if (sky_cover[2] == "CAVOK") {skycover3 = "CAVOK"};

   if (debug == 1) { print("%determineWeatherCondition - sky_cover " +sky_cover[0])};

   if (wx_string.indexOf("-") !=-1 ) {
     wSeverity = "light";
   } else if (wx_string.indexOf("+") !=-1 ) {
      wSeverity = "heavy";
   } else {
     wSeverity = "medium";  // moderate conditions have no descriptor
   }

   if (debug == 1) { print("%determineWeatherCondition - wx_string " +wx_string)};
   if (debug == 1) { print("%determineWeatherCondition - wSeverity " +wSeverity)};
   if (wx_string.indexOf("UP") !=-1 ) {presentConditions += "unknown ";}

   //in the absence of a weather code assume clear sky
   //var presentConditions = "clear and sunny";
   weatherVal="0cloud.png";

   //determine the weather type,
   if (wx_string.indexOf("MI") !=-1 ) {
     wModifier += "shallow ";
   }
   if (wx_string.indexOf("PR") !=-1 ) {
     wModifier += "partial ";
   }
   if (wx_string.indexOf("DZ") !=-1 ) {
     wModifier += "drizzle ";
   }
   if (wx_string.indexOf("BC") !=-1 ) {
     wModifier += "patches of ";
   }
   if (wx_string.indexOf("DR") !=-1 ) {
     wModifier += "drifting ";
   }
   if (wx_string.indexOf("BL") !=-1 ) {
     wModifier += "blowing ";
   }
   if (wx_string.indexOf("SH") !=-1 ) {
     wModifier += "showers ";
   }
   if (wx_string.indexOf("VC") !=-1 ) {
     //presentConditions += "nearby ";
     wModifier += "nearby ";
   }
   if (wx_string.indexOf("FZ") !=-1 ) {
     //presentConditions += "freezing ";
     wModifier += "freezing ";
   }

   // FEW = 1 or 2 eighths cover; SCT = 3 or 4 eighths cover; BKN = 5, 6 or 7 eighths cover & OVC = 8/8 cover

   //use the cloud code to determine cloud cover
    if (skycover1 == "SKC" || skycover2  == "SKC" || skycover3 == "SKC" ) {skyClarity = "Clear skies"};   // default clear
    if (skycover1 == "CLR" || skycover2  == "CLR" || skycover3 == "CLR" ) {skyClarity = "Clear skies"};   // default
    if (skycover1 == "VV " || skycover2  == "VV " || skycover3 == "VV " ) {skyClarity = "Vertical visibility"};      // default
    if (skycover1 == "CAVOK" || skycover2  == "CAVOK" || skycover3 == "CAVOK") {skyClarity = "Ceiling and visibility OK"};       // default

    if (skycover1 == "FEW" || skycover2  == "FEW" || skycover3 == "FEW") {
      //Partly cloudy"
      weatherVal="1cloud_norain.png";
    };
    if (skycover1 == "SCT" || skycover2  == "SCT" || skycover3 == "SCT") {
      //skyClarity = "Scattered clouds"
      weatherVal="2cloud_norain.png";
    };
    if (skycover1 == "BKN" || skycover2  == "BKN" || skycover3 == "BKN") {
      //skyClarity = "Mostly cloudy"
      weatherVal="3cloud_norain.png";
    };
    if (skycover1 == "OVC" || skycover2  == "OVC" || skycover3 == "OVC") {
      //skyClarity = "Overcast"
      weatherVal="4cloud_norain.png";
    };


   //type of weather - snow
   if (wx_string.indexOf("SN") !=-1 || wx_string.indexOf("SG") !=-1 ) {

       if (wSeverity=="light") {
          if (skycover1 == "SCT" || skycover2  == "SCT" || skycover3 == "SCT") {
             //skyClarity = "Scattered clouds"
             weatherVal="1cloud_lightsnow.png"; //default
          };
          if (skycover1 == "BKN" || skycover2  == "BKN" || skycover3 == "BKN") {
            //skyClarity = "Mostly cloudy"
            weatherVal="2cloud_lightsnow.png";
          };
          if (skycover1 == "OVC" || skycover2  == "OVC" || skycover3 == "OVC"){
            //skyClarity = "Mostly cloudy"
            weatherVal="4cloud_lightsnow.png";
          };
       }
       if (wSeverity=="medium") {
          if (skycover1 == "SCT" || skycover2  == "SCT" || skycover3 == "SCT") {
            //skyClarity = "Scattered clouds"
            weatherVal="2cloud_snow.png";
          };
          if (skycover1 == "BKN" || skycover2  == "BKN" || skycover3 == "BKN") {
            //skyClarity = "Mostly cloudy"
            weatherVal="2cloud_snow.png";
          };
          if (skycover1 == "OVC" || skycover2  == "OVC" || skycover3 == "OVC") {
            //skyClarity = "Overcast"
            weatherVal="3cloud_snow.png";
          };
       }
       if (wSeverity=="heavy") {
            weatherVal="4cloud_heavysnow.png";
       }
   }
   
   // no need to take the cloud into account, always cloudy with hail
   var weatherType = "none";
   if (wx_string.indexOf("IC") !=-1 ) {
     //presentConditions += "ice crystals ";
     weatherType = "hail";
   }
   if (wx_string.indexOf("PE") !=-1 ) {
     //presentConditions += "ice pellets ";
     weatherType = "hail";
   }
   if (wx_string.indexOf("GR") !=-1 ) {
     //presentConditions += "hail ";
     weatherType = "hail";
   }
   if (wx_string.indexOf("GS") !=-1 ) {
     //presentConditions += "small hail ";
     weatherType = "hail";
   }  // and/or snow pellets

   //type of weather - hail
   if (weatherType == "hail") {
       if (wSeverity=="light") {
          weatherVal="2cloud_hail.png"; //default
          if (skycover1 == "OVC" || skycover2  == "OVC" || skycover3 == "OVC") {
            //skyClarity = "Mostly cloudy"
            weatherVal="4cloud_lighthail.png";
          };
       }
       if (wSeverity=="medium") {
          if ((skycover1 == "SCT" || skycover2  == "SCT" || skycover3 == "SCT")||(skycover1 == "BKN" || skycover2  == "BKN" || skycover3 == "BKN"))  {
            //skyClarity = "Scattered clouds"
            weatherVal="2cloud_hail.png";
          };
          if (skycover1 == "OVC" || skycover2  == "OVC" || skycover3 == "OVC") {
            //skyClarity = "Mostly cloudy"
            weatherVal="3cloud_hail.png";
          };
       }
       if (wSeverity=="heavy") {
            weatherVal="4cloud_heavyhail.png";
       }
   }
   
    // this caters for the event when there are showers indicated but no associated rain code
    // it is strange but it quite often occurs...
    if (wx_string.indexOf("SH") !=-1 && wx_string.indexOf("SN") == -1 && wx_string.indexOf("SG") == -1 && weatherType != "hail")
    {
         //if no RAin code nor hail or snow but showers indicated then just assume rain...
         showersIcon.src= "Resources/icons_metar/day/" + "showers.png";
    } else {
         showersIcon.src= "";
    }

   //type of weather - rain
   if (wx_string.indexOf("RA") !=-1 ) {
       wSeverity="light"; // default
     //presentConditions += "rain ";
       if (wSeverity=="light") {
          if (skycover1 == "FEW" || skycover2  == "FEW" || skycover3 == "FEW") {
            //Partly cloudy"
            weatherVal="1cloud_lightrain.png";
          };
          if (skycover1 == "SCT" || skycover2  == "SCT" || skycover3 == "SCT") {
            //skyClarity = "Scattered clouds"
            weatherVal="2cloud_lightrain.png";
          };
          if (skycover1 == "BKN" || skycover2  == "BKN" || skycover3 == "BKN") {
            //skyClarity = "Mostly cloudy"
            weatherVal="3cloud_lightrain.png";
          };
          if (skycover1 == "OVC" || skycover2  == "OVC" || skycover3 == "OVC") {
            //skyClarity = "Overcast"
            weatherVal="4cloud_lightrain.png";
          };
       }
       if (wSeverity=="medium") {
          if (skycover1 == "FEW" || skycover2  == "FEW" || skycover3 == "FEW") {
            //Partly cloudy"
            weatherVal="1cloud_modrain.png";
          };
          if (skycover1 == "SCT" || skycover2  == "SCT" || skycover3 == "SCT") {
            //skyClarity = "Scattered clouds"
            weatherVal="2cloud_modrain.png";
          };
          if (skycover1 == "BKN" || skycover2  == "BKN" || skycover3 == "BKN") {
            //skyClarity = "Mostly cloudy"
            weatherVal="3cloud_modrain.png";
          };
          if (skycover1 == "OVC" || skycover2  == "OVC" || skycover3 == "OVC") {
            //skyClarity = "Overcast"
            weatherVal="4cloud_modrain.png";
          };
       }
       if (wSeverity=="heavy") {
          if (skycover1 == "FEW" || skycover2  == "FEW" || skycover3 == "FEW") {
            //Partly cloudy"
            weatherVal="1cloud_heavyrain.png";
          };
          if (skycover1 == "SCT" || skycover2  == "SCT" || skycover3 == "SCT") {
            //skyClarity = "Scattered clouds"
            weatherVal="2cloud_heavyrain.png";
          };
          if (skycover1 == "BKN" || skycover2  == "BKN" || skycover3 == "BKN") {
            //skyClarity = "Mostly cloudy"
            weatherVal="3cloud_heavyrain.png";
          };
          if (skycover1 == "OVC" || skycover2  == "OVC" || skycover3 == "OVC") {
            //skyClarity = "Overcast"
            weatherVal="4cloud_heavyrain.png";
          };
       }
       
       if (wx_string.indexOf("TS") !=-1 ) {
            wModifier += "thunderstorm ";
            weatherVal="4cloud_heavyrain.png";
       }
   }

   fogIcon.src= "";    //default
   if (wx_string.indexOf("BR") !=-1 || wx_string.indexOf("FG") !=-1 ) {
     //presentConditions += "fog " or "mist";}
     if (wSeverity=="light") {
          fogIcon.src= "Resources/icons_metar/day/" + "1_fog.png";  //night or day makes no difference
       }
       if (wSeverity=="medium") {
          fogIcon.src= "Resources/icons_metar/day/" + "2_fog.png";
       }
       if (wSeverity=="heavy") {
          fogIcon.src= "Resources/icons_metar/day/" + "3_fog.png";
       }
   }

   //windIcon.src= "Resources/icons_metar/night/windy03.png";   //default
   if (wx_string.indexOf("SQ") !=-1 ) {
     //presentConditions += "strong winds ";
     windIcon.src= "Resources/icons_metar/day/" + "n_wind.png";
   }

   exoticIcon.src= "";   //default
   //exotic types - we have no icons for any of these
   if (wx_string.indexOf("FU") !=-1 ) {
      exoticIcon.src= "Resources/icons_metar/day/" + "smoke.png";
      //presentConditions += "smoke ";
   }
   if (wx_string.indexOf("VA") !=-1 ) {
     //presentConditions += "volcanic ash ";
      exoticIcon.src= "Resources/icons_metar/day/" + "volcano.png";
   }
   if (wx_string.indexOf("DU") !=-1 ) {
     //presentConditions += "widespread dust ";}
      exoticIcon.src= "Resources/icons_metar/day/" + "dust.png";
   }
   if (wx_string.indexOf("SA") !=-1 ) {
     //presentConditions += "sand ";}
      exoticIcon.src= "Resources/icons_metar/day/" + "sand.png";
   }
   if (wx_string.indexOf("HZ") !=-1 ) {
     //presentConditions += "haze ";}
      exoticIcon.src= "Resources/icons_metar/day/" + "haze.png";
   }
   if (wx_string.indexOf("PY") !=-1 ) {
     //presentConditions += "spray ";}
      exoticIcon.src= "Resources/icons_metar/day/" + "spray.png";
   }
   if (wx_string.indexOf("PO") !=-1 ) {
     //presentConditions += "dustdevils ";}
      exoticIcon.src= "Resources/icons_metar/day/" + "dustdevil.png";
   }
   if (wx_string.indexOf("FC") !=-1 ) {
     //presentConditions += "tornado ";}
      exoticIcon.src= "Resources/icons_metar/day/" + "tornado.png";
   }
   if (wx_string.indexOf("SS") !=-1 ) {
     //presentConditions += "sandstorm/duststorm ";}
      exoticIcon.src= "Resources/icons_metar/day/" + "duststorm.png";
   }

    if (weatherVal) {
      if (isDay == true ) {
         var iconSrc= icon.src = "Resources/icons_metar/day/" + weatherVal;
         icon.src = iconSrc;
         preceding.src = iconSrc    ;
         following.src = iconSrc    ;
      } else {
         var iconSrc= "Resources/icons_metar/night/n_" + weatherVal;
         icon.src = iconSrc;
         preceding.src = iconSrc    ;
         following.src = iconSrc    ;
      }
    } else {
      icon.src = "Resources/icons/globe.png";
    }
   if (debug == 1) { print("%determineWeatherCondition - iconSrc " +iconSrc)};
}
//=====================
//End function
//=====================



//=====================================================================================
//  function to decode cloud cover information into a text form
//=====================================================================================
function get_cloud_cover(sky_cover){
// Decodes cloud cover information.
// Format is SKC or CLR for clear skies, or cccnnn where ccc = 3-letter
// code and nnn = altitude of cloud layer in hundreds of feet. 'VV' seems
// to be used for very low cloud layers. (Other conversion factor:
// 1 m = 3.28084 ft)
// FEW = 1 or 2 eighths cover; SCT = 3 or 4 eighths cover; BKN = 5, 6 or 7 eighths cover & OVC = 8/8 cover

    var skyClarity = bf("_ceiling_and_visibility_OK");
    if (sky_cover[0] == "SKC") {skyClarity = bf("_clear_skies")};
    if (sky_cover[0] == "CLR") {skyClarity = bf("_clear_skies")};
    if (sky_cover[0] == "FEW") {skyClarity = bf("_partly_cloudy")};
    if (sky_cover[0] == "SCT") {skyClarity = bf("_scattered_clouds")};
    if (sky_cover[0] == "BKN") {skyClarity = bf("_mostly_cloudy")};
    if (sky_cover[0] == "OVC") {skyClarity = bf("_overcast")};
    if (sky_cover[0] == "VV ") {skyClarity = bf("_vertical_visibility")};
    if (sky_cover[0] == "CAVOK ") {skyClarity = bf("_ceiling_and_visibility_OK")};

//    (1) there are no clouds below 5000 feet above aerodrome level (AAL) or minimum sector altitude (whichever is higher) and no cumulonimbus or towering cumulus; (2) visibility is at least 10 kilometres (6 statute miles) or more; and (3) no current or forecast significant weather such as precipitation, thunderstorms, shallow fog or low drifting snow

    if (sky_cover[1] == "FEW" && sky_cover[0] != sky_cover[1]) {skyClarity += " + " + bf("_partly_cloudy")};
    if (sky_cover[1] == "SCT" && sky_cover[0] != sky_cover[1]) {skyClarity += " + " + bf("_scattered_clouds")};
    if (sky_cover[1] == "BKN" && sky_cover[0] != sky_cover[1]) {skyClarity += " + " + bf("_mostly_cloudy")};
    if (sky_cover[1] == "OVC" && sky_cover[0] != sky_cover[1]) {skyClarity += " + " + bf("_overcast")};

    if (debug == 1) { print("%get_cloud_cover - part " +skyClarity)};
    return skyClarity;

}
//=====================
//End function
//=====================



//========================================================================
// function to set the metar description text returning presentConditions just for the bk tooltip according to information received
//========================================================================
function getMetarDescription(wx_string) {

   var presentConditions = "";

   var wSeverity="";
   var wModifier="";

   if (wx_string.indexOf("UP") !=-1 ) {presentConditions += "unknown ";}

   //in the absence of a weather code assume clear sky
   //var presentConditions = "clear and sunny";
   weatherVal="0cloud.png";

   //determine the strength of the weather type, light, medium, heavy or very heavy
   if (wx_string.indexOf("MI") !=-1 ) {
     wModifier += bf("_shallow");
   }
   if (wx_string.indexOf("PR") !=-1 ) {
     wModifier += bf("_partial");
   }
   if (wx_string.indexOf("DZ") !=-1 ) {
     wModifier += bf("_drizzle");
   }
   if (wx_string.indexOf("BC") !=-1 ) {
     wModifier += bf("_patches of");
   }
   if (wx_string.indexOf("DR") !=-1 ) {
     wModifier += bf("_drifting");
   }
   if (wx_string.indexOf("BL") !=-1 ) {
     wModifier += bf("_blowing");
   }
   if (wx_string.indexOf("SH") !=-1 ) {
     wModifier += bf("_showers");
   }
   if (wx_string.indexOf("VC") !=-1 ) {
     //presentConditions += "nearby ";
     wModifier += bf("_in_the_vicinity");
   }
   if (wx_string.indexOf("FZ") !=-1 ) {
     //presentConditions += "freezing ";
     wModifier += bf("_freezing");
   }
   if (wx_string.indexOf("TS") !=-1 ) {
     wModifier += bf("_thunderstorm");
   }

   if ( wModifier!="") {
        presentConditions = wModifier;
   }

   if (wx_string.indexOf("-") !=-1 ) {
     wSeverity = bf("_light") + " ";
   } else if (wx_string.indexOf("+") !=-1 ) {
      wSeverity = bf("_heavy") + " ";
   } else {
     wSeverity = "";  // moderate conditions have no descriptor
   }

   if (wx_string.indexOf("-") ==-1 || wx_string.indexOf("+") ==-1 ) {
        presentConditions += wSeverity;
        if (debug == 1) { print("%getMetarDescription - wSeverity " +wSeverity)};
   }

   if (wx_string.indexOf("RA") !=-1 ) {presentConditions += bf("_rain") + " ";}    
   if (wx_string.indexOf("SN") !=-1 ) {presentConditions += bf("_snow") + " ";}
   if (wx_string.indexOf("SG") !=-1 ) {presentConditions += bf("_snow_grains") + " ";}
   if (wx_string.indexOf("IC") !=-1 ) {presentConditions += bf("_ice_crystals") + " ";}
   if (wx_string.indexOf("PE") !=-1 ) {presentConditions += bf("_ice_pellets") + " ";}
   if (wx_string.indexOf("GR") !=-1 ) {presentConditions += bf("_hail") + " ";}
   if (wx_string.indexOf("GS") !=-1 ) {presentConditions += bf("_small_hail") + " ";}
   if (wx_string.indexOf("UP") !=-1 ) {presentConditions += bf("_unknown") + " ";}
   if (wx_string.indexOf("BR") !=-1 ) {presentConditions += bf("_mist") + " ";}
   if (wx_string.indexOf("FG") !=-1 ) {presentConditions += bf("_fog") + " ";}
   if (wx_string.indexOf("FU") !=-1 ) {presentConditions += bf("_smoke") + " ";}
   if (wx_string.indexOf("VA") !=-1 ) {presentConditions += bf("_volcanic_ash") + " ";}
   if (wx_string.indexOf("DU") !=-1 ) {presentConditions += bf("_widespread_dust") + " ";}
   if (wx_string.indexOf("SA") !=-1 ) {presentConditions += bf("_sand") + " ";}
   if (wx_string.indexOf("HZ") !=-1 ) {presentConditions += bf("_haze") + " ";}
   if (wx_string.indexOf("PY") !=-1 ) {presentConditions += bf("_spray") + " ";}
   if (wx_string.indexOf("PO") !=-1 ) {presentConditions += bf("_dustdevils") + " ";}
   if (wx_string.indexOf("SQ") !=-1 ) {presentConditions += bf("_strong_winds") + " ";}
   if (wx_string.indexOf("FC") !=-1 ) {presentConditions += bf("_tornado") + " ";}
   if (wx_string.indexOf("SS") !=-1 ) {presentConditions += bf("_sandstorm_duststorm") + " ";}
   if (debug == 1 && presentConditions != "") {print("%getMetarDescription - presentConditions " +presentConditions)};
   return presentConditions;
}
//=====================
//End function
//=====================


//========================================================================
// function to convert a string to a date
//========================================================================
function stringToDate(s)  {
  s = s.split(/[-: ]/);
  return new Date(s[0], s[1]-1, s[2], s[3], s[4], s[5]);
}
//=====================
//End function
//=====================

//========================================================================
// function to convert degrees to a compass bearing
//========================================================================
function degToCompass(num) {
    val=parseInt((num/22.5)+.5);
    var arr=["N","NNE","NE","ENE","E","ESE", "SE", "SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
    //print arr[(val % 16)];
    compassDirection= arr[(val % 16)];
    return  compassDirection;
}
//=====================
//End function
//=====================


//========================================================================
// function to convert a wind speed to the Beaufort scale (extended)
//========================================================================
function beaufortConversion(wind_speed_kt) {
 windIcon.src= "";
 windIcon.tooltip = "";
//   Beaufort Scales (Wind Speed)
 if (wind_speed_kt < 1) {
   force = 0; // Calm 	Sea like a mirror.
   windIcon.src= "";
 }
 if (wind_speed_kt >= 1 && wind_speed_kt <= 3 ) {
   force = 1;  // 1 1-3	Light air 	Ripples only.
 }
 if (wind_speed_kt >= 4 && wind_speed_kt <= 6 ) {
   force = 2; // 4-6	Light breeze 	Small wavelets (0.2 m). Crests have a glassy appearance.
 }
 if (wind_speed_kt >= 7 && wind_speed_kt <= 10) {
   force = 3; // 7-10  Gentle breeze 	Large wavelets (0.6 m), crests begin to break.
 }
 if (wind_speed_kt >=11 && wind_speed_kt <= 16) {
   force = 4; // 11-16  Moderate breeze 	Small waves (1 m), some whitecaps
   windIcon.src= "Resources/icons_metar/night/" + "windy01.png"
   windIcon.tooltip = "Moderate breeze " + "force " + force;
 }
 if (wind_speed_kt >=17 && wind_speed_kt <= 21) {
   force = 5; //  17-21 Fresh breeze
   windIcon.src= "Resources/icons_metar/night/" + "windy02.png"
   windIcon.tooltip = "Fresh breeze " + "force " + force;
 }
 if (wind_speed_kt >=22 && wind_speed_kt <= 27) {
   force = 6; // 22-27 Strong breeze
   windIcon.src= "Resources/icons_metar/night/" + "windy03.png"
   windIcon.tooltip = "Strong Wind " + "force " + force;
 }
 if (wind_speed_kt >=28 && wind_speed_kt <= 33) {
   force = 7; // 28-33 Near gale
   windIcon.src= "Resources/icons_metar/night/" + "windy04.png"
   windIcon.tooltip = "Near gale " + "force " + force;
 }
 if (wind_speed_kt >=34 && wind_speed_kt <= 40) {
   force = 8; // 34-40 Gale
   windIcon.tooltip = "Gale " + "force " + force;
   windIcon.src= "Resources/icons_metar/night/" + "windy05.png"
 }
 if (wind_speed_kt >=41 && wind_speed_kt <= 47) {
   force = 9; // 41-47 Strong gale
   windIcon.tooltip = "Strong gale " + "force " + force;
   windIcon.src= "Resources/icons_metar/night/" + "windy05.png"
 }
 if (wind_speed_kt >=48 && wind_speed_kt <= 55) {
   force = 10; // 48-55 Storm
   windIcon.tooltip = "Storm " + "force " + force;
   windIcon.src= "Resources/icons_metar/night/" + "windy05.png"
 }
 if (wind_speed_kt >=56 && wind_speed_kt <= 63) {
   force = 11; // 56-63 Violent storm
   windIcon.tooltip = "Violent storm " + "force " + force;
   windIcon.src= "Resources/icons_metar/night/" + "windy05.png"
 }
 if (wind_speed_kt >=64 && wind_speed_kt <= 79) {
   force = 12; // 64+ Hurricane
   windIcon.tooltip = "Hurricane " + "force " + force;
   windIcon.src= "Resources/icons_metar/night/" + "windy05.png"
 }
 if (wind_speed_kt >=80 && wind_speed_kt <= 88) {
   force = 13; // 80+ Typhoon
   windIcon.tooltip = "Typhoon " + "force " + force;
   windIcon.src= "Resources/icons_metar/night/" + "windy05.png"
 }
 if (wind_speed_kt >=89 && wind_speed_kt <= 98) {
   force = 14; // 80+ Typhoon
   windIcon.tooltip = "Typhoon " + "force " + force;
   windIcon.src= "Resources/icons_metar/night/" + "windy05.png"
 }
 if (wind_speed_kt >=99 && wind_speed_kt <=107) {
   force = 15; // 80+ Typhoon
   windIcon.tooltip = "Typhoon " + "force " + force;
   windIcon.src= "Resources/icons_metar/night/" + "windy05.png"
 }
 if (wind_speed_kt >=108 && wind_speed_kt <=117) {
   force = 16; // 80+ Severe Typhoon
   windIcon.tooltip = "Severe Typhoon " + "force " + force;
   windIcon.src= "Resources/icons_metar/night/" + "windy05.png"
 }
 if (wind_speed_kt >=118) {
   force = 17; // 80+ Severe Typhoon
   windIcon.tooltip = "Severe Typhoon " + "force " + force;
   windIcon.src= "Resources/icons_metar/night/" + "windy05.png"
 }
 //windIcon.tooltip = windIcon.tooltip + " " + clock_hand.tooltip;
 return force;
}
//=====================
//End function
//=====================



//========================================================================
// function to set the mainweather icon tooltip according to two sources
//========================================================================
function  setIconTooltip(wx_string, sky_cover) {
            //firstly, try the wx_string
            icon.Tooltip = getMetarDescription(wx_string);
            if (icon.Tooltip == "" ) {
              // if no wx_string use the cloud cover or lack of it
              icon.Tooltip = get_cloud_cover(sky_cover);
            }
            icon.Tooltip = bk.Tooltip;

            //if (debug == 1) { print("%setIconTooltip - icon.Tooltip " +icon.Tooltip)};

}
//=====================
//End function
//=====================


//======================================================================================
// Search Location - function to open the remote service provider
//======================================================================================
logo.onClick = function() {
    if (preferences.soundpref.value === "enable") {
        play(buzzer, false);
    }
    openURL("http://aviationweather.gov");
};
//=====================
//End function
//=====================




//===========================================
// Function
//===========================================
function busyStop() {
    print("%myStatusProc - stopping the busy timer ");
    busyTimer.ticking=false;
    busy.visible=false;
    busyBlur.visible=false;
}
//=====================
//End function
//=====================
