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

Components.utils.import("chrome://thintabs/content/javascript/sfab/CSSBuilder.js");
Components.utils.import("chrome://thintabs/content/javascript/sfab/DynamicStyleSheets.js");
Components.utils.import("chrome://thintabs/content/javascript/sfab/Preferences.js");

var ThinTabs = {
	preferences : new Preferences(),
	
	styleSheets : new DynamicStyleSheets(),
	
	tabmixPreferences : new Preferences(),
	
	destroy : function() {
		this.preferences.destroy();
		this.tabmixPreferences.destroy();
		this.styleSheets.unregisterAll();
	},
	
	init : function() {
		this.styleSheets.init();
		this.styleSheets.registerPath("main", "resource://thintabs/content/css/main.css");
		
		this.preferences.init("extensions.org.bonsaimind.thintabs.");
		this.tabmixPreferences.init("extensions.tabmix.");
		this.initPreferences();
	},
	
	initPreferences : function() {
		// Needed for the inlined functions further down.
		var _this = this;
		
		var tabmixSupport = function(name, value) {
			var tabBarHeight = _this.preferences.getInt("tabs.height");
			var multirowCount = _this.tabmixPreferences.getInt("tabBarMaxRow", 1);
			
			var cssTabMixSupport = new CSSBuilder("#tabmixScrollBox");
			cssTabMixSupport = cssTabMixSupport.forceHeight(tabBarHeight * multirowCount);
			_this.styleSheets.register("tabmixplus.support", cssTabMixSupport.toCSS());
		}
		this.tabmixPreferences.addListener("tabBarMaxRow", tabmixSupport, this.tabmixPreferences.getInt);
		
		this.preferences.registerBool("close.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder(".tab-close-button:not([pinned])");
				css = css.hide();
				_this.styleSheets.register(name, css.toCSS());
			} else {
				_this.styleSheets.unregister(name);
			}
		});
		this.preferences.registerInt("close.padding.top", -5, function(name, value) {
			var css = new CSSBuilder(".tab-close-button");
			css = css.autoPadding("top", value);
			_this.styleSheets.register(name, css.toCSS());
			
			// TODO This fixes that the close button is squeezed on 28.
			var cssSecondary = new CSSBuilder(".tab-close-button")
			if (value >= -10) {
				cssSecondary = cssSecondary.margin("bottom", -value - 10);
			}
			_this.styleSheets.register(name + ".secondary", cssSecondary.toCSS());
		});
		
		this.preferences.registerBool("icon.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder(".tab-icon-image:not([pinned])");
				css = css.hide();
				_this.styleSheets.register(name, css.toCSS());
			} else {
				_this.styleSheets.unregister(name);
			}
		});
		this.preferences.registerInt("icon.padding.top", -3, function(name, value) {
			var css = new CSSBuilder(".tab-icon-image");
			css = css.addSelector(".tab-throbber")
			css = css.autoPadding("top", value);
			_this.styleSheets.register(name, css.toCSS());
			
			// TODO This fixes that the icon is squeezed on 28.
			var cssSecondary = new CSSBuilder(".tab-icon-image");
			cssSecondary = cssSecondary.addSelector(".tab-throbber");
			
			if (value >= -5) {
				cssSecondary = cssSecondary.margin("bottom", -value - 5);
			}
			_this.styleSheets.register(name + ".secondary", cssSecondary.toCSS());
		});
		
		this.preferences.registerBool("sound.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder(".tab-icon-sound:not([pinned])");
				css = css.hide();
				_this.styleSheets.register(name, css.toCSS());
			} else {
				_this.styleSheets.unregister(name);
			}
		});
		this.preferences.registerInt("sound.padding.top", -2, function(name, value) {
			var css = new CSSBuilder(".tab-icon-sound");
			css = css.autoPadding("top", value);
			_this.styleSheets.register(name, css.toCSS());
		});
		
		var tabsHeightFunction = function(name, value) {
			var height = _this.preferences.getInt("tabs.height");
			
			var css = new CSSBuilder(".tab-background-start[selected=true]::after");
			css = css.addSelector(".tab-background-start[selected=true]::before");
			css = css.addSelector(".tab-background-start");
			css = css.addSelector(".tab-background-end");
			css = css.addSelector(".tab-background-end[selected=true]::after");
			css = css.addSelector(".tab-background-end[selected=true]::before");
			css = css.addSelector("#tabs-toolbar"); // Thunderbird
			css = css.addSelector("#tabbar-toolbar"); // Thunderbird
			css = css.height(height);
			css = css.minHeight(height);
			_this.styleSheets.register("tabs.height", css.toCSS());
			
			var cssSecondary = new CSSBuilder("#tabmixScrollBox > *");
			cssSecondary = cssSecondary.addSelector("#TabsToolbar > #alltabs-button");
			cssSecondary = cssSecondary.addSelector("#TabsToolbar > #new-tab-button");
			cssSecondary = cssSecondary.addSelector("#TabsToolbar > #tabmix-tabs-closebutton");
			cssSecondary = cssSecondary.addSelector(".tabbrowser-tab");
			cssSecondary = cssSecondary.addSelector(".tabbrowser-tabs > .tabbrowser-arrowscrollbox > .scrollbutton-down");
			cssSecondary = cssSecondary.addSelector(".tabbrowser-tabs > .tabbrowser-arrowscrollbox > .scrollbutton-up");
			cssSecondary = cssSecondary.addSelector(".tabbrowser-tabs > .tabbrowser-arrowscrollbox > .arrowscrollbox-overflow-end-indicator");
			cssSecondary = cssSecondary.addSelector(".tabbrowser-tabs > .tabbrowser-arrowscrollbox > .arrowscrollbox-overflow-start-indicator");
			cssSecondary = cssSecondary.forceHeight(height);
			_this.styleSheets.register("tabs.height-secondary", cssSecondary.toCSS());
			
			if (_this.preferences.getBool("tabs.force_height")) {
				var cssForcedHeight = new CSSBuilder(".tabbrowser-tabs");
				cssForcedHeight.forceHeight(height);
				_this.styleSheets.register("tabs.height-force", cssForcedHeight.toCSS());
			} else {
				_this.styleSheets.unregister("tabs.height-force");
			}
			
			tabmixSupport();
		};
		this.preferences.registerInt("tabs.height", 19, tabsHeightFunction);
		this.preferences.registerBool("tabs.height_forced", false, tabsHeightFunction);
		
		this.preferences.registerBool("tabs.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder("#TabsToolbar");
				css = css.addSelector("#tabs-toolbar"); // Thunderbird
				css = css.add("visibility", "collapse");
				_this.styleSheets.register(name, css.toCSS());
			} else {
				_this.styleSheets.unregister(name);
			}
		});
		this.preferences.registerInt("tabs.padding.end", 6, function(name, value) {
			var css = new CSSBuilder(".tab-content:not([pinned])");
			css = css.autoMozPadding("end", value);
			_this.styleSheets.register(name, css.toCSS());
		});
		this.preferences.registerInt("tabs.padding.start", 3, function(name, value) {
			var css = new CSSBuilder(".tab-content:not([pinned])");
			css = css.autoMozPadding("start", value);
			_this.styleSheets.register(name, css.toCSS());
		});
		var tabsWidthFunction = function(name, value) {
			if (_this.preferences.getBool("tabs.width.override")) {
				var width = _this.preferences.getInt("tabs.width")
				var css = new CSSBuilder(".tabbrowser-tab");
				// TODO .tabmail-tab does not accept the forced width.
				css = css.addSelector(".tabmail-tab"); // Thunderbird
				css = css.forceWidth(width);
				_this.styleSheets.register("tabs.width", css.toCSS());
			} else {
				_this.styleSheets.unregister("tabs.width");
			}
		}
		this.preferences.registerInt("tabs.width", 200, tabsWidthFunction);
		this.preferences.registerBool("tabs.width.override", false, tabsWidthFunction);
		
		var fontFamilyFunction = function(name, value) {
			if (_this.preferences.getBool("text.font.family.override")) {
				var css = new CSSBuilder(".tab-text.tab-label:not([pinned])");
				css = css.fontFamily(_this.preferences.getChar("text.font.family"));
				_this.styleSheets.register("text.font.family", css.toCSS());
			} else {
				_this.styleSheets.unregister("text.font.family");
			}
		};
		this.preferences.registerChar("text.font.family", "monospace", fontFamilyFunction);
		this.preferences.registerBool("text.font.family.override", false, fontFamilyFunction);
		
		var fontSizeFunction = function(name, value) {
			if (_this.preferences.getBool("text.font.size.override")) {
				var css = new CSSBuilder(".tab-text.tab-label:not([pinned])");
				css = css.fontSize(_this.preferences.getInt("text.font.size"));
				_this.styleSheets.register("text.font.size", css.toCSS());
			} else {
				_this.styleSheets.unregister("text.font.size");
			}
		};
		this.preferences.registerInt("text.font.size", 8, fontSizeFunction);
		this.preferences.registerBool("text.font.size.override", false, fontSizeFunction);
		
		this.preferences.registerBool("text.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder(".tab-text");
				css = css.hide();
				_this.styleSheets.register(name, css.toCSS());
			} else {
				_this.styleSheets.unregister(name);
			}
		});
		
		this.preferences.registerInt("text.padding.left", 3, function(name, value) {
			var css = new CSSBuilder(".tab-text.tab-label:not([pinned])");
			css = css.autoPadding("left", value);
			_this.styleSheets.register(name, css.toCSS());
		});
		
		this.preferences.registerInt("text.padding.top", 1, function(name, value) {
			var css = new CSSBuilder(".tab-text.tab-label:not([pinned])");
			css = css.autoPadding("top", value);
			_this.styleSheets.register(name, css.toCSS());
		});
		
		this.preferences.registerBool("throbber.hide", false, function(name, value) {
			if (value) {
				var css = new CSSBuilder(".tab-throbber:not([pinned])");
				css = css.hide();
				_this.styleSheets.register(name, css.toCSS());
			} else {
				_this.styleSheets.unregister(name);
			}
		});
	}
};

