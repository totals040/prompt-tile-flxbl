public with sharing class Utility {

    /* ========================================================= */
    /*     Interface
    /* ========================================================= */
    /**
     * Forwards Generic Event from Aura components to Salesforce Event Bus.
     * 
     * @param  status  status will be assigned to Generic_Event__e.Status__c field
     * @param  message message will be assigned to Generic_Event__e.Data__c field
     * @return         return serialized Database.SaveResult
     */
    @AuraEnabled
    public static String publishPlatformEvent(String status, String message) {
        try {
            Generic_Event__e event = new Generic_Event__e(
                Status__c = status
                , Data__c = message
            );
            return EventBus.publish(event).getId();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /* ========================================================= */
    /*     Work with Schema
    /* ========================================================= */

    public static Schema.ChildRelationship getRelationshipByName(Id parentObjId, String childRelApiName) {
        String sObjectName = String.valueOf(parentObjId.getSobjectType());
        if (String.isBlank(sObjectName)) { return null; }

        return getRelationshipByName(sObjectName, childRelApiName);
    }

    public static Schema.ChildRelationship getRelationshipByName(String sObjectName, String childRelApiName) {
        List<Schema.ChildRelationship> childRelationships = Schema.getGlobalDescribe().get(sObjectName).getDescribe().getChildRelationships();
        for (Schema.ChildRelationship relationship : childRelationships) {
            if (relationship.getRelationshipName() != null 
                    && relationship.getRelationshipName().equalsIgnoreCase(childRelApiName)) {
                return relationship;
            }
        }
        return null;
    }
}