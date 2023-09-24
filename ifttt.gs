/*

GsIFTTT

Call IFTTT Webhooks from Google Scripts

Setup:

    Add a Script Property to your project named "ifttt_key" to store your IFTTT API Key

Usage:

    var ifttt = new GsIFTTT('key');
    ifttt.setConfig('event-name','value1','value2','value3');   //value2 and value3 are optional
    ifttt.call(function() {
      //Run this code if call is successful
    },function() {
      //Run this code if call fails
    });

*/

class GsIFTTT {
	constructor(key) {
		this.key = ScriptProperties.getProperty('ifttt_key');
		this.config = null;
	}

	setConfig(event,v1,v2,v3) {
		if (event && v1) {
			var payload = {};
			payload['value1'] = v1;
			if (v2) payload['value2'] = v2;
			if (v2) payload['value3'] = v3;
			
			this.config = {
				event : event,
				payload : JSON.stringify(payload)
			};
		}
		else {
			return false;
		}	
	}
	
	call(success,error) {
    		if (this.config) {
			var reqOptions = {
				'method' : 'post',
				'contentType' : 'application/json',
				'payload' : this.config.payload
			};
			
			var requestUrl = ('https://maker.ifttt.com/trigger/' + this.config.event + '/with/key/' + this.key).toString();
			      
			var req = UrlFetchApp.fetch(requestUrl,reqOptions);
			    	
			if (req.getResponseCode() == 200) {
				console.log(req.getContentText());
				if (success) success();
			}
			else {
				console.log(req.getContentText());
				if (error) error();
			}
		}
		else {
			return false;
		}
	}
}
