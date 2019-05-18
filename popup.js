
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
	
	for(var j = 0; j < tabs.length-1; j++) {
	  // Store group of tabs with same domain in temporary array
	  // First element in group
	  if(tabs_temp.length === 0 && tabs[j].url == tabs[j+1].url) {
	    tabs_temp.push(tabs[j]);
		tabs_temp.push(tabs[j+1]);
		continue;
	  // Other elements
	  } else if(tabs_temp.length > 0 && tabs_temp[tabs_temp.length-1].url == tabs[j+1].url) {
		tabs_temp.push(tabs[j+1]);
		continue;
	  } else {
        // If no group, just add the tab
	    if(tabs_temp.length === 0) {
	      tabs_sorted.push(tabs[j]);
	    // Else, sort group
		} else {
		  // Sort group
		  tabs_temp.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
		  // Add to total
		  tabs_sorted = tabs_sorted.concat(tabs_temp);
		  // Reset temporary array
		  tabs_temp = [];
		}
	  }
	}
	
	// Redo sorting for last group
	if(tabs_temp.length === 0) {
	  tabs_sorted.push(tabs[j]);
    } else {
	  tabs_temp.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
	  tabs_sorted = tabs_sorted.concat(tabs_temp);
	  tabs_temp = [];
	}

// Testing for missing elements after tab title sorting
/*
	var res = [];
	tabs.forEach(function (tab, i) { 
	  res = tabs_sorted.filter(function (tab_orig) {  
	                             return (tab_orig.title == tab.title && tab_orig.url == tab.url); 
	                           } );
	    if(res.length == 0)
		  console.log("--- err : tab ["+i+"] removed : "+tab.title+"    "+tab.url+" ---"); 
	  });
*/
	
	// Move tabs according to sort
	tabs_sorted.forEach(function (tab, i) { 
      chrome.tabs.move(tab.id, { index: i });
	 // console.log("Tab n°: "+i+" id: "+tab.id+" index: "+tab.index+" URL: "+tab.url+" title: "+tab.title+" window id: "+tab.windowId); 
	});
  });
};
