/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This is a fork/based on Small Tabs, written by ロシア,
 * https://addons.mozilla.org/en-US/firefox/addon/small-tabs/
 */

"use strict";

function startup(data, reason) {
	// Load the dependencies in the constructor, because the chrome.manifest
	// hasn't been read before that.
	
	Components.utils.import("chrome://thintabs/content/javascript/ResourceAlias.js");
	Components.utils.import("chrome://thintabs/content/javascript/ThinTabs.js");
	
	ResourceAlias.register(data);
	ThinTabs.init();
}

function shutdown(data, reason) {
	ResourceAlias.unregister();
	ThinTabs.uninit();
}

function install(data, reason) {
}

function uninstall(data, reason) {
}
