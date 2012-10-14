/**
 * Facebook loader require.js module-plugin
 * Loads FACEBOOK JS-API asynchronously allowing to use it as a require.js module
 *
 * To use it:
 * require( ['facebook-api!appId:123456790'], function(FB) {
 *   FB.api('/me', function(me){
 *     console.log(me.name);
 *   });
 * });
 *
 * Requires (propertyParser)[https://github.com/millermedeiros/requirejs-plugins/blob/master/src/propertyParser.js] to be present in AMD dependencies
 *
 * Author: Konstantin Raev (bestander@gmail.com)
 * Version: 0.1.0 (13 Oct 2012)
 * Released under the MIT license
 */
define(['propertyParser'], function (propertyParser) {

  return{
    load : function (name, req, onLoad, config) {
      var settings = propertyParser.parseProperties(name);

      window.fbAsyncInit = function () {
        FB.init({
          appId : settings.appId,
          status : true,
          cookie : true,
          xfbml : true,
          oauth : true
        });
        onLoad(FB);
      };

      (function (d) {
        var js, id = 'facebook-jssdk';
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement('script');
        js.id = id;
        js.async = true;
        js.src = "//connect.facebook.net/en_US/all.js";
        d.getElementsByTagName('head')[0].appendChild(js);
      }(document));
    }
  }
});