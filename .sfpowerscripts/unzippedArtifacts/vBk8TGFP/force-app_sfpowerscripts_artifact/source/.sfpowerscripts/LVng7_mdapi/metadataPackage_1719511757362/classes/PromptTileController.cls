/**
 * Created by serhii on 13/03/2024.
 */

public with sharing class PromptTileController {
    
    @AuraEnabled
    public static List<SObject> getRecords (String paramStr) {
        PromptTileService.Params params = (PromptTileService.Params)JSON.deserialize(paramStr, PromptTileService.Params.class);
        if (! params.isValidated()) {
            throw new AuraHandledException('Check parameters passed to APEX');
        }
        if (params.getChildRelationship() == null) {
            String msg = 'No such relationship ' + params.childRelApiName + ' to object ' + String.valueOf(params.parentId.getSobjectType());
            throw new AuraHandledException(msg);
        }
        return new PromptTileService().getChildJunctionRecordsByParIdAndRelName(params);
    }
}