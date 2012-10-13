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
 * Author: Konstantin Raev (bestander@gmail.com)
 * Version: 0.0.5 (13 Oct 2012)
 * Released under the MIT license
 */
define(['async', 'propertyParser'], function (async, propertyParser) {

  return {
    load : function (name, req, onLoad, config) {
      if (config.isBuild) {
        onLoad(null); //avoid errors on the optimizer
      } else {
        // parse settings passed with the plugin
        var settings = propertyParser.parseProperties(name);

        req(['async!' + (document.location.protocol === 'https:' ? 'https' : 'http') + '://connect.facebook.net/en_US/all.js'], function () {
          FB.init({
            appId : settings.appId,
            status : true,
            cookie : true,
            xfbml : true,
            oauth : true
          });
          onLoad(FB);
        });
      }
    }
  };

});
