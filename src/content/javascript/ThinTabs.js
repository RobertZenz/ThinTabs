/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This is a fork/based on Small Tabs, written by ロシア,
 * https://addons.mozilla.org/en-US/firefox/addon/small-tabs/
 */

"use strict";

var EXPORTED_SYMBOLS = [ "ThinTabs" ];

Components.utils.import("resource://gre/modules/Services.jsm");

Components.utils.import("chrome://thintabs/content/javascript/DynamicStyleSheets.js");

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
					DynamicStyleSheets
							.register("hideIcon", ".tab-icon-image:not([pinned]) { display: none !important}");
				} else {
					DynamicStyleSheets.unregister("hideIcon");
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
