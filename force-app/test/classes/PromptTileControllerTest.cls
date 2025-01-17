@isTest
public class PromptTileControllerTest {
    private static final String PAR_NAME = 'Parent Name';
    private static final String PAR_NAME1 = 'Parent Name1';
    private static final String LIB_NAME = 'Library Name';
    @TestSetup
    private static void makeData() {
        test_Parent__c parentRec = new test_Parent__c(Name = PAR_NAME);
        test_Parent__c parentRec1 = new test_Parent__c(Name = PAR_NAME1);
        insert new List<test_Parent__c>{parentRec, parentRec1};
        test_Library__c library = new test_Library__c(Name = LIB_NAME);
        insert library;
        test_ChildSimple__c childRec = new test_ChildSimple__c (
                                Name = 'Child Lastname'
                                , test_ParentTag__c = parentRec.Id);
        test_ChildSimple__c junctionRec = new test_ChildSimple__c (
                                Name = 'Child Lastname'
                                , test_Parent__c = parentRec1.Id
                                , test_Library__c = library.Id);
        insert new List<test_ChildSimple__c>{childRec, junctionRec};
    }

    @isTest
    private static void itShouldRetrieveRecordsForChildRel() {
        test_Parent__c parentRec = [SELECT Id FROM test_Parent__c WHERE Name = :PAR_NAME LIMIT 1];
        String paramStr = '{"labelFldName":"Name","childRelApiName":"test_ChildSimples1__r","parentIdStr":"'+parentRec.Id+'","parentRelLibApiName":null}';

        Test.startTest();
        List<SObject> childs = PromptTileController.getRecords(paramStr);
        Test.stopTest();

        Assert.areEqual(1, childs.size(), 'it should return one child test record');
    }

    @isTest
    private static void itShouldRetrieveRecordsForJunctionRel() {
        test_Parent__c parentRec1 = [SELECT Id FROM test_Parent__c WHERE Name = :PAR_NAME1 LIMIT 1];
        test_Library__c library = [SELECT Id FROM test_Library__c WHERE Name = :LIB_NAME LIMIT 1];
        String paramStr = '{"labelFldName":"Name","childRelApiName":"test_ChildSimples__r","parentIdStr":"'+parentRec1.Id+'","parentRelLibApiName":"test_Library__c"}';

        Test.startTest();
        List<test_ChildSimple__c> childs = (List<test_ChildSimple__c>)PromptTileController.getRecords(paramStr);
        Test.stopTest();

        Assert.areEqual(1, childs.size(), 'it should return one child test record');
        Assert.areEqual(library.Id, childs[0].test_Library__c, 'it should be equal to Library Id');
    }

    @isTest
    private static void itShouldReturnParamsNotValidatedError() {
        test_Parent__c parentRec = [SELECT Id FROM test_Parent__c WHERE Name = :PAR_NAME LIMIT 1];
        String paramStr = '{"labelFldName":"Name","childRelApiName":"","parentIdStr":"'+parentRec.Id+'","parentRelLibApiName":null}';

        List<SObject> childs;
        Boolean isAuraExceptionCaught;
        Test.startTest();
        try {
            childs = PromptTileController.getRecords(paramStr);
        } catch (AuraHandledException ex) {
            isAuraExceptionCaught = true;
        }
        Test.stopTest();

        Assert.isTrue(isAuraExceptionCaught, 'it should throw AuraHandled exception');
        Assert.isNull(childs, 'it should return null for child test records');
    }

    @isTest
    private static void itShouldReturnChildRelationshipError() {
        test_Parent__c parentRec = [SELECT Id FROM test_Parent__c WHERE Name = :PAR_NAME LIMIT 1];
        String paramStr = '{"labelFldName":"Name","childRelApiName":"_randomREL_","parentIdStr":"'+parentRec.Id+'","parentRelLibApiName":null}';

        List<SObject> childs;
        Boolean isAuraExceptionCaught;
        Test.startTest();
        try {
            childs = PromptTileController.getRecords(paramStr);
        } catch (AuraHandledException ex) {
            isAuraExceptionCaught = true;
        }
        Test.stopTest();

        Assert.isTrue(isAuraExceptionCaught, 'it should throw AuraHandled exception');
        Assert.isNull(childs, 'it should return null for child test records');
    }
}