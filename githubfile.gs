/*
  Update Files using Github API from Google Script
  
  Installation:

    1) Add file to the top of the list in App Script project
    
    2) Add the following script properties to App Script project:
    
        github_user -> will contain the username of the commit user
        github_email -> will contain the e-mail address of the commit user
        github_token -> will contain the personal access token (for API connection)

  Usage:
  
    Instantiate the object:
    
      var gh = new GithubFile();

    Get information on a repository entry (returns same object as Github REST API "Get Repository Content"):

      gh.getEntry("<repository-name","<file-path>");

    For details on getEntry return value, see https://docs.github.com/en/rest/repos/contents?apiVersion=2022-11-28#get-repository-content

    To update a file in a repository:

      gh.updateFile("<repository-name>","<file-path>","<file-SHA>","<commit-message>","<new-file-content>");
    
    Note that the <file-SHA> is an element of the object returned by getEntry()
    
*/

class GithubFile {
  constructor() {
    this.USER = PropertiesService.getScriptProperties().getProperty('github_user');;
    this.EMAIL = PropertiesService.getScriptProperties().getProperty('github_email');;
    this.TOKEN = PropertiesService.getScriptProperties().getProperty('github_token');;
  }
  		
  getEntry(repo,filepath) {
    var url = "https://api.github.com/repos/" + this.USER + "/" + repo + "/contents" + filepath;
    
    var headers = {};

    headers['Authorization'] = 'Bearer ' + this.TOKEN;
    headers['X-GitHub-Api-Version'] = '2022-11-28';

    var reqOptions = {
	    'method' : 'get',
      'headers' : headers
	  };
    
    var req = UrlFetchApp.fetch(url,reqOptions);

    if (req.getResponseCode() == 200) {
      var content = JSON.parse(req.getContentText());
      return content;
    }
    else {
      throw EvalError();
    }
  }
  
  updateFile(repo,filepath,sha,msg,content) {
    var contentBytes = (Utilities.newBlob(content)).getBytes();

    var payload = {
      "message" :  msg,
      "committer" : {
        "name" : this.USER,
        "email" : this.EMAIL
      },
      "content" : Utilities.base64Encode(contentBytes),
      "sha" : sha
    };    

    var headers = {
      "Accept" : "application/vnd.github+json",
      "Authorization" : "Bearer " + this.TOKEN,
      "X-GitHub-Api-Version" : "2022-11-28"
    };

    var reqOptions = {
      "method" : "put",
      "headers" : headers,
      "payload" : JSON.stringify(payload),
      "muteHttpExceptions" : true
    };
    
    var url = "https://api.github.com/repos/" + this.USER + "/" + repo + "/contents" + filepath;
    
    var req = UrlFetchApp.fetch(url,reqOptions);

    var resp = {
      status : req.getResponseCode(),
      body : req.getContentText(),
      headers : req.getHeaders()
    };
  
    if (req.getResponseCode() == 200) {
      return resp;
    }
    else {
      throw EvalError(JSON.stringify(resp));
    }
  }
}
