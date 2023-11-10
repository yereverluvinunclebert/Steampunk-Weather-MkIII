# Steampunk-Weather-MkIII

![weatherGaugeSteampunk](https://github.com/yereverluvinunclebert/Steampunk-Weather-MkIII/assets/2788342/315839f7-163a-4448-afd2-47f60fa499fa)

Steampunk Desktop Weather widget, written in Javascript and XML for the Yahoo 
Widget (Konfabulator) Engine. Created for XP, Vista, Win7, 8, 10+ as well as the 
Apple Mac.

A Steampunk Weather widget. This Weather widget is a simple combined Weather 
gauge. Functional and gorgeous at the same time.

This Steampunk Weather Widget is loosely based on the Digistation widget written, enhanced and steampunked by Dean Beedell. Displays local air pressure, temperature and humidity, as well as the general weather outlook in hundreds of cities around the world. The widget has been given a completely new steampunk skin and loads of new functionality.

![location_search_help](https://github.com/yereverluvinunclebert/Steampunk-Weather-MkIII/assets/2788342/1e9f75c8-0d2c-4132-ab8a-b36b29150f9c)

To find out how the widget operates, simply right click and select Help and a 
full explanation of all the buttons, windows is shown. The top left window is 
the current power in digital form. Hovering over any control should supply a 
pop-up explaining each function.

![weather-gauge-metal-404](https://github.com/yereverluvinunclebert/Steampunk-Weather-MkIII/assets/2788342/a6054634-6a21-4d75-b31a-48e87e426c59)

Right clicking will bring up a menu of options. Double-clicking on the widget 
will cause a personalised Windows application to fire up. The first time you run 
it there will be no assigned function and so it will state as such and then pop 
up the preferences so that you can enter the command of your choice. The widget 
takes command line-style commands for windows. 

All javascript widgets need an engine to function, in this case the widget uses 
the Yahoo Widget Konfabulator engine. The engine interprets the javascript and 
creates the widget according to the XML description and using the images you 
provide. 

![yahoo-logo-small_111](https://github.com/yereverluvinunclebert/Steampunk-MediaPlayer-Ywidget/assets/2788342/c5668608-ab57-4665-a332-3bc9b7e07a9f)
 
It takes the weather from forecasts provided by airports and airfields. If you 
can find an airfield nearby that has an ICAO code then it will supply local 
weather data. You enter your local town name and if it has an airfield then it 
will have a forecast. The data feed is provided by Aviation Weather GOV -
 
	aviationweather.gov/  
	
The new widget gives windspeed and direction, it reports the cloud layers, 
it handles more exotic forms of weather but most important of all uses a feed 
from a source that is unlikely to go offline for long periods. It uses the feed 
from aviationweather.gov a US government department. The feed is decoded METAR 
in XML form so it is easy enough to use. It is also free and does not require an 
API. The search for metar codes is performed offline using a local list of metar 
stations in a static data file. There are currently 10,000 Metar locations and 
so a search using a local file is much quicker than an online one.

![weather-gauge-help4](https://github.com/yereverluvinunclebert/Steampunk-Weather-MkIII/assets/2788342/a3bc8f1f-73bc-42cc-9c73-b643fd0457e1)

The new widget also has a pop-up window that summarises weather information in 
a text form in addition to the image display on the main gauge. 
 
Here is a Youtube video of the Yahoo Weather widget shown in all its steampunk 
functionality, I think you will find it is fascinating as well as useful. I do 
hope so.

https://www.youtube.com/watch?v=Z_IO5Q2RSs0

Built using: 

	RJTextEd Advanced Editor  https://www.rj-texted.se/ 
	Adobe Photoshop CS ver 8.0 (2003)  https://www.adobe.com/uk/products/photoshop/free-trial-download.html  
	Yahoo widgets SDK: runtime, debugger and documentation
  
Tested on :

	ReactOS 0.4.14 32bit on virtualBox    
	Windows 7 Professional 32bit on Intel    
	Windows 7 Ultimate 64bit on Intel    
	Windows 7 Professional 64bit on Intel    
	Windows XP SP3 32bit on Intel    
	Windows 10 Home 64bit on Intel    
	Windows 10 Home 64bit on AMD    
	Windows 11 64bit on Intel 
   
 Dependencies:
 
 o A windows-alike o/s such as Windows XP, 7-11 or Apple Mac OSX 11.   
 o Installation of the yahoo widget SDK runtime engine  
 
	Yahoo widget engine for Windows - http://g6auc.me.uk/ywidgets_sdk_setup.exe  
	Yahoo widget engine for Mac - https://rickyromero.com/widgets/downloads/yahoo-widgets-4.5.2.dmg
 
 Running the widget using a javascript engine frees javascript from running only 
 within the captivity of a browser, you will now be able to run these widgets on 
 your Windows desktop as long as you have the correct widget engine installed.
 
![yahoo-logo-small_111](https://github.com/yereverluvinunclebert/Steampunk-MediaPlayer-Ywidget/assets/2788342/c5668608-ab57-4665-a332-3bc9b7e07a9f)
  
 Instructions for running Yahoo widgets on Windows
 =================================================
 
 1. Install yahoo widget SDK runtime engine
 2. Download the gauge from this repo.
 3. Unzip it
 4. Double-click on the resulting .KON file and it will install and run
 
 Instructions for running Yahoo widgets on Mac OS/X ONLY
 ========================================================
 
 1. Install yahoo widget SDK runtime engine for Mac
 2. Download the gauge from this repo.
 3. Unzip it
 4. For all all recent versions of Mac OS/X including Sierra, edit the following 
 file:
 
 com.yahoo.widgetengine.plist which is in /Users/xxx/Library/Preferences. Look 
 for these lines: 
    
   <key>DockOpen</key>  
   <string>false</string>  
 
 Change to false if it is true.
 
 5. Double-click on the widgets .KON file and it will install and run
 
 Wit these instructions you should be able to start Yahoo! Widgets and the 
 menubar item should appear. Widgets can then be started from the menubar or by 
 double-clicking on the KON file in the usual way.
 
 LICENCE AGREEMENTS:
 
 Copyright 2023 Dean Beedell
 
 In addition to the GNU General Public Licence please be aware that you may use
 any of my own imagery in your own creations but commercially only with my
 permission. In all other non-commercial cases I require a credit to the
 original artist using my name or one of my pseudonyms and a link to my site.
 With regard to the commercial use of incorporated images, permission and a
 licence would need to be obtained from the original owner and creator, ie. me.
 



