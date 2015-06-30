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
	preferences : new Preferences(),
	tabmixPreferences : new Preferences(),
	
	destroy : function() {
		this.preferences.destroy();
		this.tabmixPreferences.destroy();
		DynamicStyleSheets.unregisterAll();
	},
	
	init : function() {
		DynamicStyleSheets.init();
		DynamicStyleSheets.registerPath("main", "resource://thintabs/content/css/main.css");
		
		this.preferences.init("extensions.org.bonsaimind.thintabs.");
		this.tabmixPreferences.init("extensions.tabmix.");
		this.initPreferences();
	},
	
	initPreferences : function() {
		// Needed for the inlined functions further down.
		var instance = this;
		
		var tabmixSupport = function(name, value) {
			var tabBarHeight = instance.preferences.getInt("tabs.height");
			var multirowCount = instance.tabmixPreferences.getInt("tabBarMaxRow", 1);
			
			var cssTabMixSupport = new CSSBuilder("#tabmixScrollBox");
			cssTabMixSupport = cssTabMixSupport.forceHeight(tabBarHeight * multirowCount);
			DynamicStyleSheets.register("tabmixplus.support", cssTabMixSupport.toCSS());
		}
		this.tabmixPreferences.addListener("tabBarMaxRow", tabmixSupport, this.tabmixPreferences.getInt);
		
		this.preferences.registerBool("close.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder(".tab-close-button:not([pinned])").hide();
				DynamicStyleSheets.register(name, css.toCSS());
			} else {
				DynamicStyleSheets.unregister(name);
			}
		});
		this.preferences.registerInt("close.padding.top", -1, function(name, value) {
			var css = new CSSBuilder(".tab-close-button").autoPadding("top", value);
			DynamicStyleSheets.register(name, css.toCSS());
		});
		
		this.preferences.registerBool("icon.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder(".tab-icon-image:not([pinned])").hide();
				DynamicStyleSheets.register(name, css.toCSS());
			} else {
				DynamicStyleSheets.unregister(name);
			}
		});
		this.preferences.registerInt("icon.padding.top", -1, function(name, value) {
			var css = new CSSBuilder(".tab-icon-image").autoPadding("top", value);
			DynamicStyleSheets.register(name, css.toCSS());
		});
		
		this.preferences.registerInt("tabs.height", 19, function(name, value) {
			var css = new CSSBuilder(".tab-background-start[selected=true]::after");
			css = css.addSelector(".tab-background-start[selected=true]::before");
			css = css.addSelector(".tab-background-start");
			css = css.addSelector(".tab-background-end");
			css = css.addSelector(".tab-background-end[selected=true]::after");
			css = css.addSelector(".tab-background-end[selected=true]::before");
			css = css.addSelector("#tabs-toolbar"); // Thunderbird
			css = css.addSelector("#tabbar-toolbar"); // Thunderbird
			css = css.height(value);
			css = css.minHeight(value);
			DynamicStyleSheets.register(name, css.toCSS());
			
			var cssSecondary = new CSSBuilder("#tabmixScrollBox > *");
			cssSecondary = cssSecondary.addSelector("#alltabs-button");
			cssSecondary = cssSecondary.addSelector("#new-tab-button");
			cssSecondary = cssSecondary.addSelector("#tabmix-tabs-closebutton");
			cssSecondary = cssSecondary.addSelector(".tabbrowser-tab");
			cssSecondary = cssSecondary.addSelector(".tabbrowser-tabs > .tabbrowser-arrowscrollbox > .scrollbutton-down");
			cssSecondary = cssSecondary.addSelector(".tabbrowser-tabs > .tabbrowser-arrowscrollbox > .scrollbutton-up");
			cssSecondary = cssSecondary.addSelector(".tabbrowser-tabs > .tabbrowser-arrowscrollbox > .arrowscrollbox-overflow-end-indicator");
			cssSecondary = cssSecondary.addSelector(".tabbrowser-tabs > .tabbrowser-arrowscrollbox > .arrowscrollbox-overflow-start-indicator");
			cssSecondary = cssSecondary.forceHeight(value);
			DynamicStyleSheets.register(name + "-secondary", cssSecondary.toCSS());
			
			tabmixSupport();
		});
		this.preferences.registerBool("tabs.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder("#TabsToolbar");
				css = css.addSelector("#tabs-toolbar"); // Thunderbird
				css = css.hide();
				DynamicStyleSheets.register(name, css.toCSS());
			} else {
				DynamicStyleSheets.unregister(name);
			}
		});
		this.preferences.registerInt("tabs.padding.end", 7, function(name, value) {
			var css = new CSSBuilder(".tab-content:not([pinned])").autoMozPadding("end", value);
			DynamicStyleSheets.register(name, css.toCSS());
		});
		this.preferences.registerInt("tabs.padding.start", 1, function(name, value) {
			var css = new CSSBuilder(".tab-content:not([pinned])").autoMozPadding("start", value);
			DynamicStyleSheets.register(name, css.toCSS());
		});
		var tabsWidthFunction = function(name, value) {
			if (instance.preferences.getBool("tabs.width.override")) {
				var width = instance.preferences.getInt("tabs.width")
				var css = new CSSBuilder(".tabbrowser-tab");
				// TODO .tabmail-tab does not accept the forced width.
				css = css.addSelector(".tabmail-tab"); // Thunderbird
				css = css.forceWidth(width);
				DynamicStyleSheets.register("tabs.width", css.toCSS());
			} else {
				DynamicStyleSheets.unregister("tabs.width");
			}
		}
		this.preferences.registerInt("tabs.width", 200, tabsWidthFunction);
		this.preferences.registerBool("tabs.width.override", false, tabsWidthFunction);
		
		var fontFamilyFunction = function(name, value) {
			if (instance.preferences.getBool("text.font.family.override")) {
				var css = new CSSBuilder(".tab-text.tab-label:not([pinned])");
				css = css.fontFamily(instance.preferences.getChar("text.font.family"));
				DynamicStyleSheets.register("text.font.family", css.toCSS());
			} else {
				DynamicStyleSheets.unregister("text.font.family");
			}
		};
		this.preferences.registerChar("text.font.family", "monospace", fontFamilyFunction);
		this.preferences.registerBool("text.font.family.override", false, fontFamilyFunction);
		
		var fontSizeFunction = function(name, value) {
			if (instance.preferences.getBool("text.font.size.override")) {
				var css = new CSSBuilder(".tab-text.tab-label:not([pinned])");
				css = css.fontSize(instance.preferences.getInt("text.font.size"));
				DynamicStyleSheets.register("text.font.size", css.toCSS());
			} else {
				DynamicStyleSheets.unregister("text.font.size");
			}
		};
		this.preferences.registerInt("text.font.size", 8, fontSizeFunction);
		this.preferences.registerBool("text.font.size.override", false, fontSizeFunction);
		
		this.preferences.registerBool("text.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder(".tab-text").hide();
				DynamicStyleSheets.register(name, css.toCSS());
			} else {
				DynamicStyleSheets.unregister(name);
			}
		});
		
		this.preferences.registerInt("text.padding.top", 1, function(name, value) {
			var css = new CSSBuilder(".tab-text.tab-label:not([pinned])").autoPadding("top", value);
			DynamicStyleSheets.register(name, css.toCSS());
		});
		
		this.preferences.registerBool("throbber.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder(".tab-throbber:not([pinned])").hide();
				DynamicStyleSheets.register(name, css.toCSS());
			} else {
				DynamicStyleSheets.unregister(name);
			}
		});
	}
};
