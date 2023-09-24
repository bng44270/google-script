/*
  Streamline the creation of API Endpoints on Google Script

  Usage:

    1. Create a new App Script project.
    
    2. Create a new script file, paste this code into it, and save it.
    
       NOTE:  Make sure the new callhandler script file is at the top of the file list
    
    3. In Code.gs file, paste the following code:

        var handler = new CallHandler();
        
        // Add URL handlers here
        
        function doGet(e) {
          var url = e.pathInfo;
          var param = e.parameters;
        
          var returnValue = handler.evaluate('GET',url,param);

          return ContentService.createTextOutput(returnValue);
        }
        
        function doPost(e) {
          var url = e.pathInfo;
          var param = e.parameters;
          var data = e.postData.contents;
        
          var returnValue = handler.evaluate('POST',url,param,data);

          return ContentService.createTextOutput(returnValue);
        }
    
    4. For each API Endpoint add the following code underneath the "Add URL handlers here" comment:

        handler.addOp(method,endpointPath,function(urlParams,postData) {
          //Code to execute when endpoint is accessed
          return returnValue;
        });

    NOTES:

      method - 'GET' or 'POST'
      endpointPath - string containing endpoint URL path
                   - Must start wtih "/"
                   - follows "/exec" in deployment URL
      urlParams - url parameters provided in API call (optional)
      postData - data posted on API call (optional)
      returnValue - data to be returned from API call (must be in string format)

    5. Create a new deployment of type Web App giving the 
       deployment a unique and descriptive name.

       Take note of the Web App URL when deployment has completed.

       NOTE:  If the code is modified (adding a new endpoint) the project
              must be re-deployed

*/

class CallHandler {
  constructor() {
    this.ops = [];
  }
  
  addOp(method,url,opCode) {
    if (this.validateMethod(method)) {
      var thisOp = {};
      thisOp['method'] = method;
      thisOp['url'] = url.replace(/^\//,'');
      thisOp['code'] = opCode;
      var argCount = this.getFunctionArgs(opCode).length;
      thisOp['params'] = (argCount == 1 || argCount == 2) ? true : false;
      thisOp['data'] = (argCount == 2) ? true : false;

      this.ops.push(thisOp);
    }
  }

  evaluate(method,url,param,data) {
    var returnValue = '';
    var validOps = this.ops.filter(x => (x.method == method && x.url == url));
    
    if (validOps.length == 0) {
      returnValue = "Invalid request (" + JSON.stringify({
        method : method,
        url : url,
        params : param,
        data : (data) ? data : ""
      });
    }
    else {
      validOps.forEach(o => {
        if (o.params && o.data) {
          returnValue = o.code(param,data);
        }
        else if (o.params) {
          returnValue = o.code(param);
        }
        else {
          returnValue = o.code();
        }
      });
    }

    return returnValue;
  }
  
  validateMethod(m) {
    return (["GET","POST"].indexOf(m.toUpperCase()) > -1) ? true : false;
  }

  getFunctionArgs(f) {
    return (typeof f == 'function') ? f.toString().split('\n')[0].replace(/^.*\(([^)]+)\).*$/,'$1').split(',') : false;
  }
}