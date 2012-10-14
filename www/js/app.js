// For any third party dependencies, like jQuery, place them in the lib folder.

// E.g. to add a jquery plugin dependency with volo:
// volo add -amdoff mbrevoort/jquery-facebook-multi-friend-selector friends-selector

// Configure loading modules from the lib directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'js/lib',
    paths: {
      app: '../app',
      propertyParser: 'requirejs-plugins/src/propertyParser'
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/main']);
