define(['jquery', 'facebook-api!appId:352397974851020'], function ($, FB) {

    $("#login").click(function () {
      FB.api('/me', function (me) {
        console.log(me.name);
      });
    });

  });