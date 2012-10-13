define(['jquery', 'facebook-api!appId:' + facebook_app_id], function ($, FB) {

    $("#login").click(function () {
      FB.api('/me', function (me) {
        console.log(me.name);
      });
    });
    require(['jquery', 'jquery.facebook.multifriend.select'], function($, fbFriends){
      $("#jfmfs-container").jfmfs();
    });
  });