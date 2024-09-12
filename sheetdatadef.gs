/*
  SheetDataDef - query/manipulate Google Sheet data (requires datadef.js)

  For additional information DataDef, view the documented source code:  https://github.com/bng44270/js-tools/blob/main/datadef.js

  Usage:
    
    // Instantiate SheetDataDef object with file ID, sheet name, and spreadsheet schema object (if label is not provided the field name will be used)
    // If it is an empty Sheets file new the columns will be created
    var thisSheet = new SheetDataDef('spreadsheet-id','sheet-name',{
      name : { type : SheetDataDef.StringType, label : 'Name' },
      age : { type : SheetDataDef.NumberType, label : 'Age' },
      address :  { type : SheetDataDef.StringType, label : 'Address' },
      retired : { type : SheetDataDef.BooleanType, label : 'Is Retired?' }
    });

    // Use all availble DataDef methods including insert, update, query, and delete, along with
    // all standard Array methods to manipulate spreadsheet data 
    thisSheet.insert({
      name : "Joey",
      age : 68,
      address : "54 road",
      retired : true
    });

  // Once all operations are complete, run the commit method to persist any inserts, updates, or deletes
  thisSheet.commit();
*/
class SheetDataDef extends DataDef {
  constructor(fileId,sheetName,sheetSchema) {
    var dataSchema = {};

    Object.keys(sheetSchema).forEach(thisField => {
      dataSchema[thisField] = sheetSchema[thisField].type;
    });

    super(dataSchema);
    
    var sheetFile = SpreadsheetApp.openById(fileId)
    this.SHEET = sheetFile.getSheetByName(sheetName);

    var lastCol = this.SHEET.getLastColumn();
    
    var column = 1;

    if (this.isEmpty()) {
      Object.keys(sheetSchema).forEach(thisField => {
        var label = (Object.keys(sheetSchema[thisField]).indexOf('label') > -1) ? sheetSchema[thisField].label : thisField;
        this.SHEET.getRange(1,column).setValue(label);
        column++;
      });
    }
    
    if (!(this.isEmpty())) {
      var data = [];

      for (var row = 2; row <= this.SHEET.getLastRow(); row++) {
        var thisRow = {};
  
        Object.keys(this.SCHEMA).forEach((f,col) => {
          thisRow[f] = this.SHEET.getRange(row,col+1).getValue();
        });
  
        data.push(thisRow);
      }
  
      this.bulkInsert(data);
    }
  }

  isEmpty() {
    var lastRow = this.SHEET.getLastRow();
    
    if ([0,1].indexOf(lastRow) > -1) {
      return true;
    }
    else {
      var recordLength = Object.keys(this.SCHEMA).length;
      var rowTwoEmpty = this.SHEET.getRange(2,1,(lastRow - 1),recordLength).isBlank();

      return ([1,2].indexOf(lastRow) > -1 && rowTwoEmpty) ? true : false
    }
  }

  commit() {
    if (!(this.isEmpty())) {
      var rowCount = this.SHEET.getLastRow() - 1;
      var colCount = Object.keys(this.SCHEMA).length;
      this.SHEET.getRange(2,1,rowCount,colCount).clear();
    }
    var currentRow = 2;
    this.forEach(r => {
      Object.keys(this.SCHEMA).forEach((f,col) => {
        this.SHEET.getRange(currentRow,col+1).setValue(r[f]);
      });
      currentRow++;
    });
  }
}
