/*
 *    sheetToSql - Convert Google Sheet to SQL code to create a new table and insert values (requires sheetdatadef.gs and datadef.js)
 *
 *    Usage:
 *
 *        var conv = new SheetToSql('SPREADSHEET-ID','SHEET-NAME',SHEET-SCHEMA-OBJECT,'TARGET-FOLDER-ID');
 *
 *        SHEET-SCHEMA-MAP - schema of the spreadsheet long with SQL-specific field data
 *
 *            var thisSheet = new SheetToSql('spreadsheet-id','sheet-name',{
 *                name : { type : SheetDataDef.StringType, label : 'Name', 'sqltype':'VARCHAR(100)' },
 *                age : { type : SheetDataDef.NumberType, label : 'Age', 'sqltype':'REAL' },
 *                retired : { type : SheetDataDef.BooleanType, label : 'Is Retired?', 'sqltype':'TINYINT(1)' }
 *            },'target-folder-id');
 *
 *        If sqltype property is not specified the following default type mappings will be used:
 *
 *            DataDef.StringType => 'TEXT'
 *            DataDef.NumberType => 'FLOAT'
 *            DataDef.BooleanType => 'TINYINT(1)'
 *
 *        Schema entries of DataDef.BooleanType type may contain the following two properties:
 *
 *            truevalue - SQL value for boolean True defaults
 *            falsevalue - SQL value for boolean False
 *
 *
 *    NOTE:  that string values in SQL data must be quoted inside the Javascript quotes.
 *
 */

class SheetToSql extends SheetDataDef {
    constructor(fileId,sheetName,sheetSchema,targetFolderId) {
        var sheetSchemaOnly = {};
        var sqlSchema = {};

        var defaultTypeMap = [
            [DataDef.StringType,'TEXT'],
            [DataDef.NumberType,'FLOAT'],
            [DataDef.BooleanType,'TINYINT(1)']
        ];

        Object.keys(sheetSchema).forEach(f => {
            sheetSchemaOnly[f] = {}
            sheetSchemaOnly[f]['type'] = sheetSchema[f]['type'];
            sheetSchemaOnly[f]['label'] = sheetSchema[f]['label'];

            sqlSchema[f] = {}
            sqlSchema[f]['sqltype'] = ('sqltype' in Object.keys(sheetSchema[f])) ? sheetSchema[f]['sqltype'] : defaultTypeMap.filter(x => x[0] == sheetSchema[f]['type'])[0][1];

            if (sheetSchema[f]['type'] == DataDef.BooleanType) {
                sqlSchema[f]['truevalue'] = ('truevalue' in Object.keys(sheetSchema[f])) ? sheetSchema[f]['truevalue'] : '1';
                sqlSchema[f]['falsevalue'] = ('falsevalue' in Object.keys(sheetSchema[f])) ? sheetSchema[f]['falsevalue'] : '0';
            }
        });

        super(fileId,sheetName,sheetSchemaOnly);

        this.SQL_SCHEMA = sqlSchema;
        this.tableName = sheetName.replace(/[^a-zA-Z0-9]/g,'');
        this.targetFolder = DriveApp.getFolderById(targetFolderId);
    }

    writeSql() {
        var sqlcode = "CREATE TABLE " + this.tableName + '(';

        Object.keys(this.SQL_SCHEMA).forEach((field,idx) => {
            sqlcode += field + ' ' + this.SQL_SCHEMA[field]['sqltype'];

            if (idx < (Object.keys(this.SQL_SCHEMA).length - 1)) {
                sqlcode += ','
            }
        });

        sqlcode += ');\n';

        sqlcode += 'INSERT INTO ' + this.tableName + ' VALUES '
        this.forEach((record,ridx) => {
            sqlcode += '(';

            Object.keys(record).forEach((field,fidx) => {
                if (this.SCHEMA[field] == DataDef.StringType) {
                    sqlcode += '"' + record[field] + '"';
                }

                if (this.SCHEMA[field] == DataDef.NumberType) {
                    sqlcode += record[field].toString();
                }

                if (this.SCHEMA[field] == DataDef.BooleanType) {
                    sqlcode += record[field] ? this.SQL_SCHEMA[field]['truevalue'] : this.SQL_SCHEMA[field]['falsevalue'];
                }

                if (fidx < (Object.keys(record).length - 1)) {
                    sqlcode += ',';
                }
            });

            sqlcode += ')';

            if (ridx < (this.length - 1)) {
                sqlcode += ',';
            }
        });

        sqlcode += ';\n';

        this.targetFolder.createFile(this.tableName + '.sql',sqlcode);
    }
}
