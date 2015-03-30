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

Components.utils.import("chrome://thintabs/content/javascript/CSSBuilder.js");
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
				var css = new CSSBuilder(".tab-close-button:not([pinned])").hide();
				DynamicStyleSheets.register(name, css.toCSS());
			} else {
				DynamicStyleSheets.unregister(name);
			}
		});
		Preferences.registerInt("close.padding.top", -1, function(name, value) {
			var css = new CSSBuilder(".tab-close-button").autoPadding("top", value);
			DynamicStyleSheets.register(name, css.toCSS());
		});
		
		Preferences.registerBool("icon.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder(".tab-icon-image:not([pinned])").hide();
				DynamicStyleSheets.register(name, css.toCSS());
			} else {
				DynamicStyleSheets.unregister(name);
			}
		});
		Preferences.registerInt("icon.padding.top", -1, function(name, value) {
			var css = new CSSBuilder(".tab-icon-image").autoPadding("top", value);
			DynamicStyleSheets.register(name, css.toCSS());
		});
		
		Preferences.registerInt("tabs.height", 19, function(name, value) {
			var css = new CSSBuilder(".tab-background-start[selected=true]::after");
			css = css.addSelector(".tab-background-start[selected=true]::before");
			css = css.addSelector(".tab-background-start");
			css = css.addSelector(".tab-background-end");
			css = css.addSelector(".tab-background-end[selected=true]::after");
			css = css.addSelector(".tab-background-end[selected=true]::before");
			css = css.addSelector(".tabbrowser-tabs");
			css = css.height(value);
			css = css.minHeight(value);
			DynamicStyleSheets.register(name, css.toCSS());
		});
		Preferences.registerInt("tabs.padding.end", 7, function(name, value) {
			var css = new CSSBuilder(".tab-content:not([pinned])").autoMozPadding("end", value);
			DynamicStyleSheets.register(name, css.toCSS());
		});
		Preferences.registerInt("tabs.padding.start", 1, function(name, value) {
			var css = new CSSBuilder(".tab-content:not([pinned])").autoMozPadding("start", value);
			DynamicStyleSheets.register(name, css.toCSS());
		});
		
		var fontFamilyFunction = function(name, value) {
			if (Preferences.getBool("text.font.family.override")) {
				var css = new CSSBuilder(".tab-text.tab-label:not([pinned])");
				css = css.fontFamily(Preferences.getChar("text.font.family"));
				DynamicStyleSheets.register("text.font.family", css.toCSS());
			} else {
				DynamicStyleSheets.unregister("text.font.family");
			}
		};
		Preferences.registerChar("text.font.family", "monospace", fontFamilyFunction);
		Preferences.registerBool("text.font.family.override", false, fontFamilyFunction);
		
		var fontSizeFunction = function(name, value) {
			if (Preferences.getBool("text.font.size.override")) {
				var css = new CSSBuilder(".tab-text.tab-label:not([pinned])");
				css = css.fontSize(Preferences.getInt("text.font.size"));
				DynamicStyleSheets.register("text.font.size", css.toCSS());
			} else {
				DynamicStyleSheets.unregister("text.font.size");
			}
		};
		Preferences.registerInt("text.font.size", 8, fontSizeFunction);
		Preferences.registerBool("text.font.size.override", false, fontSizeFunction);
		
		Preferences.registerInt("text.padding.top", 1, function(name, value) {
			var css = new CSSBuilder(".tab-text.tab-label:not([pinned])").autoPadding("top", value);
			DynamicStyleSheets.register(name, css.toCSS());
		});
		
		Preferences.registerBool("throbber.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder(".tab-throbber:not([pinned])").hide();
				DynamicStyleSheets.register(name, css.toCSS());
			} else {
				DynamicStyleSheets.unregister(name);
			}
		});
	}
};
