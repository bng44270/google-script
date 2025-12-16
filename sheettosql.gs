/*
    sheetToSql - Convert Google Sheet to SQL code to create a new table and insert values

    Usage:

        var conv = new SheetToSql('SPREADSHEET-ID','SHEET-NAME',SHEET-SCHEMA-OBJECT,'TARGET-FOLDER-ID');

        SHEET-SCHEMA-MAP - schema of the spreadsheet (see sheetdatadef.js for details)

    Custom Field Type Mappings:

        By default SheetToSql maps the three DataDef types to the following SQL types:

            DataDef.StringType => 'text'
            DataDef.NumberType => 'float'
            DataDef.BooleanType => 'tinyint(1)'

        If you wish to provide a custom field mapping you can supply a multi-dimentional array as a 5th argument to the SheetToSql constructor as follows:

            var conv = new SheetToSql('SPREADSHEET-ID','SHEET-NAME',SHEET-SCHEMA-OBJECT,'TARGET-FOLDER-ID',TYPE-MAP);

        Where TYPE-MAP could look like this:

            Default field type mappings:

                [
                    [DataDef.StringType,'varchar(100)'],
                    [DataDef.NumberType,'real'],
                    [DataDef.BooleanType,'tinyint(1)']
                ]

        By default SheetToSql converts boolean data to TINYINT(1) data.  If you wish to use a different SQL datatype for boolean data you can provide a 6th and 7th argument to the SheetToSql constructor for the Boolean True and Boolean False values respectively.  For example:

            var conv = new SheetToSql('SPREADSHEET-ID','SHEET-NAME',SHEET-SCHEMA-OBJECT,'TARGET-FOLDER-ID',TYPE-MAP,'"True"','"False"');


    NOTE:  that string values in SQL data must be quoted inside the Javascript quotes.

 */

class SheetToSql extends SheetDataDef {
    constructor(fileId,sheetName,sheetSchema,targetFolderId,typeMap=[[DataDef.StringType,'text'],[DataDef.NumberType,'float'],[DataDef.BooleanType,'tinyint(1)']],boolTrue='1',boolFalse='0') {
        super(fileId,sheetName,sheetSchema);
        this.tableName = sheetName.replace(/[^a-zA-Z0-9]/g,'');
        this.typeMap = typeMap;
        this.booleanTrueValue = boolTrue;
        this.booleanFalseValue = boolFalse;
        this.targetFolder = DriveApp.getFolderById(targetFolderId);
    }

    getTypeMapValue(t) {
        var mappedType = '';
        try {
            mappedType = this.typeMap.filter(x => x[0] == t)[0][1];
        }
        catch (e) {
            throw new SchemaError("Field type mapping not found for (" + t + ")");
        }

        return mappedType;
    }

    writeSql() {
        var sqlcode = "CREATE TABLE " + this.tableName + '(';

        Object.keys(this.SCHEMA).forEach((field,idx) => {
            sqlcode += field + ' ' + this.getTypeMapValue(this.SCHEMA[field]);

            if (idx < (Object.keys(this.SCHEMA).length - 1)) {
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
                    sqlcode += record[field] ? this.booleanTrueValue : this.booleanFalseValue;
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
