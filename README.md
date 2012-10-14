pong-mmo-server
==========================

A node.js mmo server for html 5 pong game.

This web project has the following setup:

* MIT-LICENSE.txt - license wording
* package.json - [npm](http://npmjs.org) and [volo](http://volojs.org/) package descriptor
* server.js - server entry point
* Procfile - [Foreman](https://github.com/ddollar/foreman) descriptor for keeping server running
* www/ - the web assets for the project
    * html/ - html pages of the app
        * index.html - the entry point into the app.
    * js/
        * app.js - the top-level config script used by index.html
        * app/ - the directory to store project-specific scripts.
        * lib/ - the directory to hold third party scripts.
* tools/ - the build tools to optimize the project.
* volofile - descriptor for [volo](http://volojs.org/) build commands
* properties/ - configuration files location,
    * app.properties.default.json5 - application specific properties like ports, key etc
    * app.properties.json5 (not source controlled) - overrides app.properties.default.json5 and all options can also be overridden with environment variables and command line arguments prefixed with --
    * log.properties.default.json5 - configuration for log4js logging utility
    * log.properties.json5 (not source controlled) - overrides log.properties.default.json5
* utils/ - application server side utilities


To optimize front end, run:
---------

    volo build

This will run the "build" command in the volofile that is in this directory.

That build command creates an optimized version of the project in a
**www-built** directory. The js/app.js file will be optimized to include
all of its dependencies.

For more information on the optimizer:
http://requirejs.org/docs/optimization.html

For more information on using requirejs:
http://requirejs.org/docs/api.html

License
----------
All application code is released under MIT License, libraries have their own permissive open source licenses.