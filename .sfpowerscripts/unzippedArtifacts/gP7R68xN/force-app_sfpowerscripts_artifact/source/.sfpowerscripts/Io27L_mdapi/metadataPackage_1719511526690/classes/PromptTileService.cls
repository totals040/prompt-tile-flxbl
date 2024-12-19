/**
 * Created by serhii on 13/03/2024.
 */
public with sharing class PromptTileService {

    public List<SObject> getChildJunctionRecordsByParIdAndRelName (Params params) {

        Id parentId = params.parentId;
        String targetFieldName = params.labelFldName;
        if (params.isLibraryPill()) {
            targetFieldName = params.getLibRelationApiName() + '.' + targetFieldName;
        }
        String relFieldName = String.valueOf(params.getChildRelationship().getField());
        List<String> flds = new List<String>{'Id', targetFieldName, relFieldName};
        // pull list of related objects
        String query = 'SELECT ' + String.join(flds,',') + 
                        ' FROM ' + String.valueOf(params.getChildRelationship().getChildSObject()) +
                        ' WHERE ' + relFieldName + ' = :parentId' +
                        ' WITH SECURITY_ENFORCED ORDER BY lastmodifieddate DESC';
        
        List<SObject> objs = Database.query(String.escapeSingleQuotes(query));
        return objs;
    }

    public inherited sharing class Params {

        @AuraEnabled public String parentIdStr {get; private set;}
        @AuraEnabled public String childRelApiName {get; private set;}
        @AuraEnabled public String labelFldName {get; private set;}
        @AuraEnabled public String parentRelLibApiName {get; private set;}
        public Id parentId {get; private set;}

        private Schema.ChildRelationship childRelationship;

        public Boolean isValidated() {
            this.parentId = Id.valueOf(this.parentIdStr);
            return String.isNotEmpty(this.childRelApiName) && String.isNotEmpty(this.labelFldName);
        }

        public Schema.ChildRelationship getChildRelationship() {
            if (this.childRelationship == null) {
                this.childRelationship = Utility.getRelationshipByName(this.parentId, this.childRelApiName);
            }
            return childRelationship;
        }

        public Boolean isLibraryPill() {
            return String.isNotBlank(this.parentRelLibApiName);
        }

        public String getLibRelationApiName() {
            return ! isLibraryPill() ? null 
                    : this.parentRelLibApiName.right(3) == '__c' ? this.parentRelLibApiName.replace('__c', '__r')
                    : this.parentRelLibApiName.right(2) == 'Id' ? this.parentRelLibApiName.substring(0, this.parentRelLibApiName.length() - 2)
                    : null;
        }
    }
}
