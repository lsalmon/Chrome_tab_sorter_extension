
'use strict';

let sortTabs = document.getElementById('sortTabs');

sortTabs.onclick = function(element) {
  chrome.tabs.query({currentWindow: true}, function(tabs) {
    var tab = null;
	var tabs_sorted = [];
	var tabs_temp = [];
    for(let [i, tab] of tabs.entries()) {
        // Do not sort chrome tabs
        if(tab.url.startsWith('chrome://')) {
		  console.log("### discarding tab "+tab.index+" "+tab.title+" window id: "+tab.windowId+" for cause of chrome tab ###");
	      tabs.splice(i, 1);
		  continue;
	    }
		// Remove chrome-extension header from tab url to sort it 
		// (useful for 'the great suspender' extension)
        if(tab.url.startsWith('chrome-extension://')) {
		  // If no http(s) present in URL, either something is wrong or it uses another protocol
		  // either way, do not sort
		  if( !(tab.url.includes("http://") || tab.url.includes("https://")) ) {
		    console.log("### discarding tab "+tab.index+" "+tab.title+" window id: "+tab.windowId+" for cause of extension ###");
	        tabs.splice(i, 1);
			continue;
	      }
	      // Else, remove chrome-extension header (remove from start to http header)
          else {
			tab.url = tab.url.substring(tab.url.search(/https?\:\/\//i), tab.url.length);
		  }
		}

		// Extract domain name for parsing 
		tab.url = tab.url.replace('http://','').replace('https://','').replace('www.','').split(/[/?#]/)[0];
		
		// Switch to lower case for sorting
		tab.url = tab.url.toLowerCase();
		tab.title = tab.title.toLowerCase();
	}

	// First sort by domain name
	tabs.sort((a,b) => (a.url > b.url) ? 1 : ((b.url > a.url) ? -1 : 0));
    // Then sort by title inside a domain name group
	tabs_sorted = [];
	tabs_temp = [];
	for(var j = 1; j < tabs.length; j++) {
	  // Store group of tabs with same domain in temporary array
	  if(tabs[j].url == tabs[j-1].url) {
	    tabs_temp.push(tabs[j]);
	  } else {
        // If no group, just add the tab
	    if(tabs_temp.length === 0) {
	      tabs_sorted.push(tabs[j]);
	    // Else, sort group
		} else {
	      tabs_temp.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
		  tabs_sorted = tabs_sorted.concat(tabs_temp);
		  // Reset temporary array
		  tabs_temp = [];
		}
	  }
	}
	
	// Move tabs according to sort
	tabs_sorted.forEach(function (tab, i) { 
      chrome.tabs.move(tab.id, { index: i });
	  console.log("Tab n°: "+tab.id+" index: "+tab.index+" URL: "+tab.url+" title: "+tab.title+" window id: "+tab.windowId); 
	});
  });
};
