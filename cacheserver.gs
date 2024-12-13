/*
  Google Apps Cache Server

  To be clear, this is basically just an HTTP wrapper for the App Script CacheService library

  As per Google documentation, the maximum key length si 250 characters,
  the maximum data length is 100 Kb, and the lifespan of a cache item is
  600 seconds (10 minutes).

  Installation:

    1. Add script to Apps Script project

    2. Deploy (note deployment URL)
  
  Set Cache Value:

      Perform HTTP POST to the deployment URL with "id" as a query string
      parameter and it's value is the cache key.

      https://script.google.com/<apps-script-uri>/exec?id=bob

      The HTTP POST body should contain a string value to store
    
  Retrieve Cache Value:

      Perform HTTP POST to the deployment URL with "id" as a query string
      parameter and it's value is the cache key.

      https://script.google.com/<apps-script-uri>/exec?id=bob

      The returned content will be the string value associated with the key
*/

class PostError extends Error {
  constructor(msg) {
    super(msg);
  }
}

class GetError extends Error {
  constructor(msg) {
    super(msg);
  }
}

function doPost(e) {
  var cache = CacheService.getScriptCache();
  var contentType = e.postData.type;
  var params = e.parameter;

  if (Object.keys(params).indexOf('id') == -1)
    throw new PostError("Must provide cache ID");
  
  var cacheValue = e.postData.contents;

  if (e.postData.length == 0) {
    throw new PostError("No data provided");
  }

  cache.put(params['id'],cacheValue);   
}

function doGet(e) {
  var cache = CacheService.getScriptCache();

  var params = e.parameter;

  if (Object.keys(params).indexOf('id') == -1)
    throw new GetError("Must provide object ID");
  
  var returnObject = cache.get(params['id']) || '';
  
  return ContentService.createTextOutput(returnObject);
}
