define(['jquery', 'facebook-api!appId:' + facebook_app_id], function ($, FB) {

    $("#login").click(function () {
      FB.api('/me', function (me) {
        console.log(me.name);
      });
    });
    require(['jquery', 'jquery.facebook.multifriend.select'], function($, fbFriends){
      FB.getLoginStatus(function(response) {
        if (response.status === "connected") {
          init();
        } else {
          // no user session available, someone you dont know
        }
      });

      function login() {
        FB.login(function(response) {
          if (response.status === "connected") {
            init();
          } else {
            alert('Login Failed!');
          }
        });
      }

      function init() {
        FB.api('/me', function(response) {
          $("#jfmfs-container").jfmfs({ max_selected: 15, max_selected_message: "{0} of {1} selected"});
        });
      }
    });
  });