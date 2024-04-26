class Notification {
  constructor(toAddr,subject,body) {
    this.MSG = {};

    if (toAddr) {
      this.MSG.to = toAddr;
    }
 
    if (subject) {
      this.MSG.subject = subject;
    }

    if (body) {
      this.MSG.body = body;
    }
 }

  get to() { return this.MSG.to; }
  get subject() { return (Object.keys(this.MSG).indexOf('subject') > -1) ? this.MSG.subject : ''; }
  get body() { return (Object.keys(this.MSG).indexOf('body') > -1) ? this.MSG.body : ''; }
  get replyTo() { return (Object.keys(this.MSG).indexOf('replyTo') > -1) ? this.MSG.replyTo : ''; }

  set to(v) { this.MSG.to = v; }
  set subject(v) { this.MSG.subject = v; }
  set body(v) { this.MSG.body = v; }
  set replyTo(v) { this.MSG.replyTo = v; }

  send() {
    var canSend = MailApp.getRemainingDailyQuota() > 0;

    if (!canSend) {
      throw EvalError("Unable to send message.  Exceeded e-mail quota");
    }
    
    var returnValue = false;

    if (Object.keys(this.MSG).indexOf('to') > -1 &&
        Object.keys(this.MSG).indexOf('subject') > -1 &&
        Object.keys(this.MSG).indexOf('body') > -1) {
      MailApp.sendEmail(this.MSG);
      returnValue = true;
    }

    return returnValue;    
  }
}
