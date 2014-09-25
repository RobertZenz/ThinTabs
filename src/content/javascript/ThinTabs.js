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
	dynamicStyleSheets : null,
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
		
		this.refreshPreference(data);
	},
	
	refreshPreference : function(name) {
		switch (name) {
			case "close.hide":
				if (this.preferences.getBoolPref(name)) {
					DynamicStyleSheets.register(name, ".tab-close-button:not([pinned]) { display: none !important; }");
				} else {
					DynamicStyleSheets.unregister(name);
				}
				break;
			
			case "close.padding.top":
				var closePaddingTop = this.preferences.getIntPref(name);
				
				DynamicStyleSheets.register(name, ".tab-close-button { margin-top: " + closePaddingTop
						+ "px !important; }");
				break;
			
			case "icon.hide":
				if (this.preferences.getBoolPref(name)) {
					DynamicStyleSheets.register(name, ".tab-icon-image:not([pinned]) { display: none !important; }");
				} else {
					DynamicStyleSheets.unregister(name);
				}
				break;
			
			case "icon.padding.top":
				var iconPaddingTop = this.preferences.getIntPref(name);
				
				DynamicStyleSheets.register(name, ".tab-icon-image { margin-top: " + iconPaddingTop
						+ "px !important; }");
				break;
			
			case "tabs.height":
				var tabsHeight = this.preferences.getIntPref(name);
				
				DynamicStyleSheets
						.register(
								name,
								".tab-background-start[selected=true]::after,\
								.tab-background-start[selected=true]::before,\
								.tab-background-start,\
								.tab-background-end,\
								.tab-background-end[selected=true]::after,\
								.tab-background-end[selected=true]::before,\
								.tabbrowser-tabs {\
								height: "
										+ tabsHeight
										+ "px !important;\
								min-height: "
										+ tabsHeight
										+ "px !important;\
								}");
				break;
			
			case "tabs.padding.end":
				var tabsPaddingEnd = this.preferences.getIntPref(name);
				
				if (tabsPaddingEnd >= 0) {
					DynamicStyleSheets.register(name, ".tab-content:not([pinned]) { -moz-padding-end: "
							+ tabsPaddingEnd + "px !important; }");
				} else {
					DynamicStyleSheets.register(name,
							".tab-content:not([pinned]) { -moz-padding-end: 0px !important; -moz-margin-end: "
									+ tabsPaddingEnd + "px !important; }");
				}
				break;
			
			case "tabs.padding.start":
				var tabsPaddingStart = this.preferences.getIntPref(name);
				
				if (tabsPaddingStart >= 0) {
					DynamicStyleSheets.register(name, ".tab-content:not([pinned]) { -moz-padding-start: "
							+ tabsPaddingStart + "px !important; }");
				} else {
					DynamicStyleSheets.register(name,
							".tab-content:not([pinned]) { -moz-padding-start: 0px !important; -moz-margin-start: "
									+ tabsPaddingStart + "px !important; }");
				}
				break;
			
			case "text.font.family":
			case "text.font.family.override":
				if (this.preferences.getBoolPref("text.font.family.override")) {
					DynamicStyleSheets.register("text.font.family", ".tab-text.tab-label:not([pinned]) { font-family: "
							+ this.preferences.getCharPref("text.font.family") + " !important; }");
				} else {
					DynamicStyleSheets.unregister("text.font.family");
				}
				break;
			
			case "text.font.size":
			case "text.font.size.override":
				if (this.preferences.getBoolPref("text.font.size.override")) {
					DynamicStyleSheets.register("text.font.size", ".tab-text.tab-label:not([pinned]) { font-size: "
							+ this.preferences.getIntPref("text.font.size") + "px !important; }");
				} else {
					DynamicStyleSheets.unregister("text.font.size");
				}
				break;
			
			case "text.padding.top":
				var textPaddingTop = this.preferences.getIntPref(name);
				
				if (textPaddingTop >= 0) {
					DynamicStyleSheets.register(name, ".tab-text.tab-label:not([pinned]) { padding-top: "
							+ textPaddingTop + "px !important; }");
				} else {
					DynamicStyleSheets.register(name, ".tab-text.tab-label:not([pinned]) { margin-top: "
							+ textPaddingTop + "px !important; }");
				}
				break;
			
			case "throbber.hide":
				if (this.preferences.getBoolPref(name)) {
					DynamicStyleSheets.register(name, ".tab-throbber:not([pinned]) { display: none !important; }");
				} else {
					DynamicStyleSheets.unregister(name);
				}
				break;
		}
	},
	
	setDefaultPreferences : function() {
		var defaultPreferences = Components.classes["@mozilla.org/preferences-service;1"].getService(
				Components.interfaces.nsIPrefService).getDefaultBranch("extensions.org.bonsaimind.thintabs.");
		
		defaultPreferences.setBoolPref("close.hide", false);
		this.refreshPreference("close.hide");
		
		defaultPreferences.setIntPref("close.padding.top", -1);
		this.refreshPreference("close.padding.top");
		
		defaultPreferences.setBoolPref("icon.hide", false);
		this.refreshPreference("icon.hide");
		
		defaultPreferences.setIntPref("icon.padding.top", -1);
		this.refreshPreference("icon.padding.top");
		
		defaultPreferences.setIntPref("tabs.height", 19);
		this.refreshPreference("tabs.height");
		
		defaultPreferences.setIntPref("tabs.padding.end", 7);
		this.refreshPreference("tabs.padding.end");
		
		defaultPreferences.setIntPref("tabs.padding.start", 1);
		this.refreshPreference("tabs.padding.start");
		
		defaultPreferences.setIntPref("tabs.padding.top", 0);
		this.refreshPreference("tabs.padding.top");
		
		defaultPreferences.setCharPref("text.font.family", "monospace");
		defaultPreferences.setBoolPref("text.font.family.override", false);
		this.refreshPreference("text.font.family.override");
		
		defaultPreferences.setIntPref("text.font.size", 8);
		defaultPreferences.setBoolPref("text.font.size.override", false);
		this.refreshPreference("text.font.size.override");
		
		defaultPreferences.setIntPref("text.padding.top", 1);
		this.refreshPreference("text.padding.top");
		
		defaultPreferences.setBoolPref("throbber.hide", false);
		this.refreshPreference("throbber.hide");
	},
	
	init : function() {
		this.preferences = Components.classes["@mozilla.org/preferences-service;1"].getService(
				Components.interfaces.nsIPrefService).getBranch("extensions.org.bonsaimind.thintabs.");
		this.preferences.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this.preferences.addObserver("", this, false);
		this.styleSheet = Services.io.newURI("resource://thintabs/thintabs.css", null, null);
		this.styleSheetService = Components.classes["@mozilla.org/content/style-sheet-service;1"]
				.getService(Components.interfaces.nsIStyleSheetService);
		
		this.setDefaultPreferences();
		this.loadStyle();
		
		Services.wm.addListener(this);
		
		this.getWindows().forEach(function(window) {
			this.loadScript(window);
		}, this);
	},
	
	uninit : function() {
		this.unloadStyle();
		
		DynamicStyleSheets.unregisterAll();
		
		Services.wm.removeListener(this);
		
		this.getWindows().forEach(function(window) {
			this.unloadScript(window);
		}, this);
	}
};
