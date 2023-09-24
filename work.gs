class Wid {
  constructor(fileId,prefix) {
    var ss = SpreadsheetApp.openById(fileId);
    this.cell = ss.getSheetByName(prefix).getRange('A1');
  }

  getNext() {
    var nextWid = parseInt(this.cell.getValue());    
    this.cell.setValue(nextWid + 1);
    return nextWid.toString().padStart(6,'0');
  }
}

class WorkItem {
	constructor(folderId,prefix) {
		try {
			this.appFolder = DriveApp.getFolderById(folderId);
			this._s = [];
			this.prefix = prefix;
			this.numberStore = '<GOOGLE-SHEET-ID-NUMBER-STORE>';
		}
		catch (e) {
			delete this;
		}
	}
	
	get states() { return this._s; }
	
	set states(s) {
		this._s = s;
		this.initialState = this.states[0];
		
		this.folders = this.states.map(s => {
			var r;
			
			var stateFolder = this.appFolder.getFoldersByName(s);
			
			if (stateFolder.hasNext()) {
				r = stateFolder.next();
			}
			else {
				r = this.appFolder.createFolder(s);
			}
			
			return r;
		});
	}
	
	create(name,description) {
		var number = this.prefix + (new Wid(this.numberStore,this.prefix).getNext());
		
		var fileId = '';
		
		fileId = (this.folders.filter(f => {
			return f.getName() == this.initialState;
		})[0].createFile(number + ' - ' + name,description,MimeType.PLAIN_TEXT)).getId();
		
		DriveApp.getFileById(fileId).setDescription('{}');
		
		return fileId;
	}
	
	setAttribute(fileId,n,v) {
		var file = DriveApp.getFileById(fileId);
		
		var attribs = JSON.parse(file.getDescription());
		
		attribs[n] = v;
		
		file.setDescription(JSON.stringify(attribs));
	}
	
	getAttribute(fileId,n) {
		var file = DriveApp.getFileById(fileId);
		
		var attribs = JSON.parse(file.getDescription());
		
		return (Object.keys(attribs).indexOf(n) > -1) ? attribs[n] : null;
	}
	
	changeState(fileId,state) {
		if (this.states.indexOf(state) > -1) {
			DriveApp.getFileById(fileId).moveTo(this.folders.filter(f => {
				return f.getName() == state;
			})[0]);
		}
	}
	
	note(fileId,notes) {
		var file = DriveApp.getFileById(fileId);
		var content = file.getBlob().getDataAsString();
		
		content += '\n\n' + (new Date().toDateString()) + ' : ' + notes;
		
		file.setContent(content);
	}
	
	
}

class TimedWorkItem extends WorkItem {
	constructor(fileId,prefix) {
		super(fileId,prefix);
	}
	
	create(name,description,due) {		
		var fileId = (super.create(name,description)).getId();
		
		var nowDate = new Date();
		if (due.getTime() < nowDate.getTime()) {
			this.setAttribute(fileId,'due',due.getTime());
		}
		
		return fileId;
	}
	
	checkDueDate(fileId) {
		var file = DriveApp.getFileById(fileId);
		
		var dueDate = this.getAttribute(fileId,'due');
		
		if (dueDate && !(file.getName().match(/\(OVERDUE\)/))) {
			var dueDate = new Date(attribs.due);
			var nowDate = new Date();
			
			if (dueDate.getTime() >= nowDate.getTime()) {
				var fileName = file.getName() + ' (OVERDUE)';
				file.setName(fileName);
				this.note(fileId,'Passed due date (' dueDate.toDateString() + ')');
			}
		}
	}
}

class Request extends TimedWorkItem {
	constructor(folder) {
		super(folder,'TSK');
		this.states = ['New','Working','Waiting','Closed'];
		this.priority = ['Low','Moderate','High'];
	}
	
	create(name,description,due) {		
		var fileId = (super.create(name,description)).getId();
		
		this.setAttribute(fileId,'priority','Low');
		this.note(fileId,'Priority: Low');
		
		return fileId;
	}
	
	priority(fileId,p) {
		if (this.priorityValues.indexOf(p) > -1) {	
			this.setAttribute(fileId,'priority',p);
			this.note(fileId,'Priority: ' + p);
		}
	}
	
	work(fileId) {
		this.changeState(fileId,'Working');
	}
	
	wait(fileId) {
		this.changeState(fileId,'Waiting');
	}
	
	close(fileId) {
		this.changeState(fileId,'Closed');
	}
}

class Approval extends WorkItem {
	constructor(folder) {
		super(folder,'APR');
		this.states = ['Pending','Rejected','Approved'];
	}
	
	reject(fileId) {
		this.changeState(fileId,'Rejected');
	}
	
	approve(fileId) {
		this.changeState(fileId,'Approved');
	}
}

class KnowledgeBase extends WorkItem {
	constructor(folder) {
		super(folder,'KNO');
		this.states = ['Proposed','Published','Retired'];
	}
		
	publish(fileId) {
		this.changeState(fileId,'Published');
	}
	
	retire(fileId) {
		this.changeState(fileId,'Retired');
	}
}

class Story extends WorkItem {
	constructor(folder) {
		super(folder,'STO');
		this.states = ['New','Development','Testing','Complete','Released','Canceled'];
	}
	
	develop(fileId) {
		this.changeState(fileId,'Development');
	}
	
	test(fileId) {
		this.changeState(fileId,'Testing');
	}
	
	complete(fileId) {
		this.changeState(fileId,'Complete');
	}
	
	release(fileId) {
		this.changeState(fileId,'Released');
	}
	
	cancel(fileId) {
		this.changeState(fileId,'Canceled');
	}
}