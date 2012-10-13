/**
 * a json5 flavor that allows to load more than one json/json5 file into a merged object
 */
// hook for json5 to enable json5 files to be required
// TODO fork on github
require('json5/lib/require');
var _ = require('underscore')
  ;

var readFile = function(fileName){
  try{
    return require(fileName)
  } catch (e){
    console.log("no json properties file %s found", fileName);
    return {};
  }
};

module.exports = function (file1, file2) {
  return _.extend(readFile(file1), readFile(file2));
};