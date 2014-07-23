/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * This is a fork of Small Tabs, written by ロシア,
 * https://addons.mozilla.org/en-US/firefox/addon/small-tabs/
 */

"use strict"

const { classes:Cc,interfaces:Ci,utils:Cu } = Components;

Cu.import("resource://gre/modules/Services.jsm");

var ThinTabs = {
	_windowtype:"navigator:browser",

	get _windows() {
		let wins = [];
		this._windowtype || (this._windowtype = "navigator:browser");
		
		let cw = Services.wm.getEnumerator(this._windowtype);
		
		while (cw.hasMoreElements()) {
			let win=cw.getNext();
			win.QueryInterface(Ci.nsIDOMWindow);
			wins.push(win);
		}
		
		return wins;
	},

	handleEvent:function(e) {
		let doc = e.target;
		let win = doc.defaultView;
		
		win.removeEventListener("load", this, true);
		
		if (doc.documentElement.getAttribute("windowtype") != this._windowtype) {
			return;
		}
		
		this.loadScript(win);
	},

	loadStyle:function(){
		let sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
		let uri = Services.io.newURI("resource://thintabs/thintabs.css", null, null);
		
		if (!sss.sheetRegistered(uri, sss.USER_SHEET)) {
			sss.loadAndRegisterSheet(uri, sss.USER_SHEET);
		}
	},

	unloadStyle:function(){
		let sss = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
		let uri = Services.io.newURI("resource://thintabs/thintabs.css", null, null);
		
		if (sss.sheetRegistered(uri, sss.USER_SHEET)) {
			sss.unregisterSheet(uri,sss.USER_SHEET);
		}
	},
		
	loadScript:function(win){
	},

	unloadScript:function(win){
	},

	onOpenWindow:function(aWindow){
		let win = aWindow.docShell.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
		win.addEventListener("load", this, true);
	},
	
	onCloseWindow:function(aWindow) {
	},
	
	onWindowTitleChange:function(aWindow,aTitle) {
	},

	init:function() {
		this.loadStyle();
		this._wm=Services.wm;
		this._wm.addListener(this);
		this._windows.forEach(function(win) {
			this.loadScript(win);
		}, this);
	},
	
	uninit:function() {
		this.unloadStyle();
		
		if (this._wm) {
			this._wm.removeListener(this);
		}
		
		delete this._wm;
		
		this._windows.forEach(function(win) {
			this.unloadScript(win);
		}, this);
	}
}

let ResourceAlias = {
	register:function(alias, data){
		let ios = Services.io;
		
		if(!alias) {
			return false;
		}
		
		this._alias = alias;
		
		if (this._resProtocolHandler) {
			return false;
		}
		
		this._resProtocolHandler = ios.getProtocolHandler("resource");
		this._resProtocolHandler.QueryInterface(Ci.nsIResProtocolHandler);
		
		let uri = data.resourceURI;
		if(!uri) {
			if(data.installPath.isDirectory()) {
				//packed
				uri = ios.newFileURI(data.installPath);
			} else {
				//unpacked
				let jarProtocolHandler = ios.getProtocolHandler("jar");
				jarProtocolHandler.QueryInterface(Ci.nsIJARProtocolHandler);
				let spec = "jar:" + ios.newFileURI(data.installPath).spec + "!/";
				uri = jarProtocolHandler.newURI(spec, null, null);
			}
		}
		
		this._resProtocolHandler.setSubstitution(alias, uri);
		
		return true;
	},
	unregister:function() {
		if(!this._resProtocolHandler) {
			return false;
		}
		
		this._resProtocolHandler.setSubstitution(this._alias, null);

		delete this._resProtocolHandler;
		delete this._alias;
		
		return true;
	}
}

function startup(data, reason) {
	const alias = "thintabs";
	ResourceAlias.register(alias, data);
	
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

