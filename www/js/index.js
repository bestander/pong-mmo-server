/*
* Author: Konstantin Raev (bestander@gmail.com)
* Released under the MIT license
*/
// expose jquery for plugins
window.jQuery = window.$ = require("jquery");

var $ = window.$
  , facebookLoader = require("./lib/facebook/loader.js")
  , friendsSelector = require("jquery-facebook-multi-friend-selector")
  , pongClient = require('super-pong');
  ;

pongClient.init('canvas-div');


$(function(){
  $("#login").click(
	  function () {
	    console.log("clicked button");
	  });
  // TODO friends selector initialize here
});

exports.initFacebook = function(facebookAppId){
	facebookLoader.load(facebookAppId, function(){
		FB.getLoginStatus(function (response) {
		  if (response.status === "connected") {
		    init();
		  } else {
		    console.log("no user session available");
		    login();
		  }
		});
	});
}

function login() {
  FB.login(function (response) {
    if (response.status === "connected") {
      init();
    } else {
      alert('Login Failed!');
    }
  });
}

function init() {
  FB.api('/me', function (response) {
    console.log(response.name);
    $("#jfmfs-container").jfmfs({ max_selected: 15, max_selected_message: "{0} of {1} selected"});
  });
}
