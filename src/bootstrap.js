/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This is a fork/based on Small Tabs, written by ロシア,
 * https://addons.mozilla.org/en-US/firefox/addon/small-tabs/
 */

"use strict";

Components.utils.import("resource://gre/modules/Services.jsm");

var ThinTabs = {
	preferences : null,
	styleSheet : null,
	styleSheetService : null,
	
	getWindows : function() {
		var windows = [];
		
		var browserWindows = Services.wm.getEnumerator("navigator:browser");
		
		while (browserWindows.hasMoreElements()) {
			var browserWindow = browserWindows.getNext();
			browserWindow.QueryInterface(Components.interfaces.nsIDOMWindow);
			windows.push(browserWindow);
		}
		
		return windows;
	},
	
	handleEvent : function(event) {
		var document = event.target;
		var window = document.defaultView;
		
		window.removeEventListener("load", this, true);
		
		if (document.documentElement.getAttribute("windowtype") != "navigator:browser") {
			return;
		}
		
		this.loadScript(window);
	},
	
	loadStyle : function() {
		if (!this.styleSheetService.sheetRegistered(this.styleSheet, this.styleSheetService.USER_SHEET)) {
			this.styleSheetService.loadAndRegisterSheet(this.styleSheet, this.styleSheetService.USER_SHEET);
		}
	},
	
	unloadStyle : function() {
		if (this.styleSheetService.sheetRegistered(this.styleSheet, this.styleSheetService.USER_SHEET)) {
			this.styleSheetService.unregisterSheet(this.styleSheet, this.styleSheetService.USER_SHEET);
		}
	},
	
	loadScript : function(window) {
	},
	
	unloadScript : function(window) {
	},
	
	onOpenWindow : function(window) {
		var domWindow = window.docShell.QueryInterface(Components.interfaces.nsIInterfaceRequestor).getInterface(
				Components.interfaces.nsIDOMWindow);
		domWindow.addEventListener("load", this, true);
	},
	
	onCloseWindow : function(window) {
	},
	
	onWindowTitleChange : function(window, title) {
	},
	
	observe : function(subject, topic, data) {
		if (topic != "nsPref:changed") {
			return;
		}
		
		switch (data) {
			case "icon.hide":
				if (this.preferences.getBoolPref("icon.hide")) {
					
				} else {
					
				}
				break;
		}
	},
	
	init : function() {
		this.preferences = Components.classes["@mozilla.org/preferences-service;1"].getService(
				Components.interfaces.nsIPrefService).getBranch("extensions.org.bonsaimind.thintabs.");
		this.preferences.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this.preferences.addObserver("", this, false);
		this.styleSheet = Services.io.newURI("resource://thintabs/thintabs.css", null, null);
		this.styleSheetService = Components.classes["@mozilla.org/content/style-sheet-service;1"]
				.getService(Components.interfaces.nsIStyleSheetService);
		
		this.loadStyle();
		
		Services.wm.addListener(this);
		
		this.getWindows().forEach(function(window) {
			this.loadScript(window);
		}, this);
	},
	
	uninit : function() {
		this.unloadStyle();
		
		Services.wm.removeListener(this);
		
		this.getWindows().forEach(function(window) {
			this.unloadScript(window);
		}, this);
	}
};

var ThinTabsResourceAlias = {
	register : function(data) {
		if (this._resourceProtocolHandler) {
			return false;
		}
		
		this._resourceProtocolHandler = Services.io.getProtocolHandler("resource");
		this._resourceProtocolHandler.QueryInterface(Components.interfaces.nsIResProtocolHandler);
		
		var uri = data.resourceURI;
		
		if (!uri) {
			if (data.installPath.isDirectory()) {
				// packed
				uri = ios.newFileURI(data.installPath);
			} else {
				// unpacked
				var jarProtocolHandler = Services.io.getProtocolHandler("jar");
				jarProtocolHandler.QueryInterface(Components.interfaces.nsIJARProtocolHandler);
				var spec = "jar:" + Services.io.newFileURI(data.installPath).spec + "!/";
				uri = jarProtocolHandler.newURI(spec, null, null);
			}
		}
		
		this._resourceProtocolHandler.setSubstitution("thintabs", uri);
		
		return true;
	},
	
	unregister : function() {
		if (!this._resourceProtocolHandler) {
			return false;
		}
		
		this._resourceProtocolHandler.setSubstitution("thintabs", null);
		delete this._resourceProtocolHandler;
		
		return true;
	}
}

function startup(data, reason) {
	ThinTabsResourceAlias.register(data);
	ThinTabs.init();
}

function shutdown(data, reason) {
	ThinTabsResourceAlias.unregister();
	ThinTabs.uninit();
}

function install(data, reason) {
}

function uninstall(data, reason) {
}
