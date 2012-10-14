/**
 * To add a jquery plugin dependency: volo add -amdoff mbrevoort/jquery-facebook-multi-friend-selector friends-selector
 */

define(['jquery', 'facebook-api!appId:' + facebook_app_id, 'friends-selector/jquery.facebook.multifriend.select'], function ($) {

  $("#login").click(function () {
    FB.api('/me', function (me) {
      console.log(me.name);
    });
  });

  FB.getLoginStatus(function (response) {
    if (response.status === "connected") {
      init();
    } else {
      // no user session available, someone you dont know
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
      $("#jfmfs-container").jfmfs({ max_selected: 15, max_selected_message: "{0} of {1} selected"});
    });
  }
});