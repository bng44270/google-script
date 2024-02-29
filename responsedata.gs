/*
Parse through Google Form Response data object

Usage:
  
  var thisResp = FormApp.getActiveForm().getResponses()[0];

  var thisRespData = new ResponseData(thisResp);

  var name = thisRespData.getField("First Name");    //sets variable to the value of the field labeled "First Name"
*/
class ResponseData {
  constructor(formResp) {
    this.OBJ = {};
    formResp.getItemResponses().forEach(i => {
      this.OBJ[i.getItem().getTitle()] = i.getResponse();
    });
  }

  getField(f) {
    return (this.validField(f)) ? this.OBJ[f] : false;
  }

  getFields() {
    return this.OBJ;
  }

  validField(f) {
    return Object.keys(this.OBJ).indexOf(f) > -1;
  }
}
