/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This is a fork/based on Small Tabs, written by ロシア,
 * https://addons.mozilla.org/en-US/firefox/addon/small-tabs/
 */

"use strict"

var EXPORTED_SYMBOLS = [ "ResourceAlias" ];

Components.utils.import("resource://gre/modules/Services.jsm");

var ResourceAlias = {
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
};
