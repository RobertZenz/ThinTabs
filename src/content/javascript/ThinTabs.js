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
Components.utils.import("chrome://thintabs/content/javascript/Preferences.js");

var ThinTabs = {
	destroy : function() {
		Preferences.destroy();
		DynamicStyleSheets.unregisterAll();
	},
	
	init : function() {
		DynamicStyleSheets.init();
		DynamicStyleSheets.registerPath("main", "resource://thintabs/content/css/main.css");
		
		Preferences.init("extensions.org.bonsaimind.thintabs.");
		this.initPreferences();
	},
	
	initPreferences : function() {
		Preferences.registerBool("close.hide", false, function(name, value) {
			if (value) {
				DynamicStyleSheets.register(name, ".tab-close-button:not([pinned]) { display: none !important; }");
			} else {
				DynamicStyleSheets.unregister(name);
			}
		});
		Preferences.registerInt("close.padding.top", -1, function(name, value) {
			DynamicStyleSheets.register(name, ".tab-close-button { margin-top: " + value + "px !important; }");
		});
		
		Preferences.registerBool("icon.hide", false, function(name, value) {
			if (value) {
				DynamicStyleSheets.register(name, ".tab-icon-image:not([pinned]) { display: none !important; }");
			} else {
				DynamicStyleSheets.unregister(name);
			}
		});
		Preferences.registerInt("icon.padding.top", -1, function(name, value) {
			DynamicStyleSheets.register(name, ".tab-icon-image { margin-top: " + value + "px !important; }");
		});
		
		Preferences
				.registerInt("tabs.height", 19, function(name, value) {
					DynamicStyleSheets
							.register(name, ".tab-background-start[selected=true]::after,\
								.tab-background-start[selected=true]::before,\
								.tab-background-start,\
								.tab-background-end,\
								.tab-background-end[selected=true]::after,\
								.tab-background-end[selected=true]::before,\
								.tabbrowser-tabs {\
								height: "
									+ value
									+ "px !important;\
								min-height: "
									+ value
									+ "px !important;\
								}");
				});
		Preferences
				.registerInt("tabs.padding.end", 7, function(name, value) {
					if (value >= 0) {
						DynamicStyleSheets.register(name, ".tab-content:not([pinned]) { -moz-padding-end: " + value
								+ "px !important; }");
					} else {
						DynamicStyleSheets
								.register(name, ".tab-content:not([pinned]) { -moz-padding-end: 0px !important; -moz-margin-end: "
										+ value + "px !important; }");
					}
				});
		Preferences
				.registerInt("tabs.padding.start", 1, function(name, value) {
					if (value >= 0) {
						DynamicStyleSheets.register(name, ".tab-content:not([pinned]) { -moz-padding-start: " + value
								+ "px !important; }");
					} else {
						DynamicStyleSheets
								.register(name, ".tab-content:not([pinned]) { -moz-padding-start: 0px !important; -moz-margin-start: "
										+ value + "px !important; }");
					}
				});
		
		var fontFamilyFunction = function(name, value) {
			if (Preferences.getBool("text.font.family.override")) {
				DynamicStyleSheets.register("text.font.family", ".tab-text.tab-label:not([pinned]) { font-family: "
						+ Preferences.getInt("text.font.family") + " !important; }");
			} else {
				DynamicStyleSheets.unregister("text.font.family");
			}
		};
		Preferences.registerChar("text.font.family", "monospace", fontFamilyFunction);
		Preferences.registerBool("text.font.family.override", false, fontFamilyFunction);
		
		var fontSizeFunction = function(name, value) {
			if (Preferences.getBool("text.font.size.override")) {
				DynamicStyleSheets.register("text.font.size", ".tab-text.tab-label:not([pinned]) { font-size: "
						+ Preferences.getInt("text.font.size") + "px !important; }");
			} else {
				DynamicStyleSheets.unregister("text.font.size");
			}
		};
		Preferences.registerInt("text.font.size", 8, fontSizeFunction);
		Preferences.registerBool("text.font.size.override", false, fontSizeFunction);
		
		Preferences.registerInt("text.padding.top", 1, function(name, value) {
			if (value >= 0) {
				DynamicStyleSheets.register(name, ".tab-text.tab-label:not([pinned]) { padding-top: " + value
						+ "px !important; }");
			} else {
				DynamicStyleSheets.register(name, ".tab-text.tab-label:not([pinned]) { margin-top: " + value
						+ "px !important; }");
			}
		});
		
		Preferences.registerBool("throbber.hide", false, function(name, value) {
			if (value) {
				DynamicStyleSheets.register(name, ".tab-throbber:not([pinned]) { display: none !important; }");
			} else {
				DynamicStyleSheets.unregister(name);
			}
		});
	}
};
