/*
  
  Add phone numbers found in Gmail e-mails to a Google single contact
  
  Usage:
  
    1. Create a contact (use an purposely invalid e-mail address)  i.e. sender-emails@myaccount
    
    2. Include this script in your project
    
    3. Initialize a CallGuard object:
    
          var cg = new CallGuard('sender-emails@myaccount');
      
    4. Process emails (by default it will process e-mails newer than 1 hour old)
    
          cg.process();
      
       Optionally add custom criteria for filtering e-mail:
       
          cg.process('newer_than:2h');
    
    5. Configure the script to trigger to run with the same rate as the process filter from step 4 
       (in this case either 1 or 2 hours)
    
  Once the contact has been populated phone calls will appear with details about the caller
  which will allow you to more accurately screen calls made as a follow up to e-mails.
  
*/

class CallGuard {
  constructor(contactEmail) {
    this.contact = ContactsApp.getContact(contactEmail);
  }
  
  getNumbers() {
    return this.contact.getPhones().map(n => n.getPhoneNumber());
  }
  
  numberExists(p) {
    return (this.getNumbers().indexOf(p) > -1) ? true : false;
  }
  
  process(filter) {
    var mailFilter = (filter) ? filter : 'newer_than:1h';
    
    var threads = GmailApp.search(mailFilter)
  
    for (var i = 0; i < threads.length; i++) {
      threads[i].getMessages().forEach(m => {
        var fromName = m.getFrom();
        
        m.getBody().match(/[0-9-.\(\) \t]+/g)
      	  .filter(x => x.length > 0 && !(x.match(/^[ \t]+$/g)))
      	  .map(x => x.trim())
      	  .filter(x => x.replace(/[^0-9]/g,'').length == 10)
      	  .filter(p => !(this.numberExists()))
      	  .forEach(p => {
            //Add Contact
            this.contact.addPhone(fromName,p);
        });
      });
    }
  }
}
