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