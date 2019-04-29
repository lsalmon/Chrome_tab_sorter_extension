
'use strict';

let sortTabs = document.getElementById('sortTabs');

sortTabs.onclick = function(element) {
  chrome.tabs.query({currentWindow: true}, function(tabs) {
    var tab = null;
    for(let [i, tab] of tabs.entries()) {
//        console.log("Tab n°: "+tab.id+" index: "+tab.index+" URL: "+tab.url+" title: "+tab.title+" window id: "+tab.windowId);
        // Do not sort chrome tabs
        if(tab.url.startsWith('chrome://')) {
		  console.log("### discarding tab "+tab.index+" "+tab.title+" window id: "+tab.windowId+" for cause of chrome tab ###");
	      tabs.splice(i, 1);
		  continue;
	    }
		// Remove chrome-extension header from tab url to sort it 
		// (useful for 'the great suspender' extension)
        if(tab.url.startsWith('chrome-extension://')) {
//console.log("[[[[[[[[ "+tab.index+" "+tab.title+" Starts with chrome-extension ]]]]]]]]");

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
		//console.log("Tab n°: "+tab.id+" index: "+tab.index+" URL: "+tab.url+" title: "+tab.title+" window id: "+tab.windowId);

		// Switch to lower case for sorting
		tab.url = tab.url.toLowerCase();
		tab.title = tab.title.toLowerCase();
		//chrome.tabs.move(tab.id, { index: 0 });
	}

    tabs.sort((a,b) => (a.title > b.title) ? 1 : ((b.title > a.title) ? -1 : 0));
	
	tabs.forEach(function (tab, i) { 
      chrome.tabs.move(tab.id, { index: i });
	  console.log("Tab n°: "+tab.id+" index: "+tab.index+" URL: "+tab.url+" title: "+tab.title+" window id: "+tab.windowId); 
	});
  });
};
