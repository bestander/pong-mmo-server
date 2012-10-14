/*
* Author: Konstantin Raev (bestander@gmail.com)
* Released under the MIT license
*/
define(['jquery', 'facebook-api!appId:' + facebook_app_id, 'friends-selector/jquery.facebook.multifriend.select'], function ($) {
  "use strict";

  $("#login").click(function () {
    console.log("clicked button");
  });

  FB.getLoginStatus(function (response) {
    if (response.status === "connected") {
      init();
    } else {
      console.log("no user session available");
      login();
    }
  });

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
});