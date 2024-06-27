trigger ChildSimpleTrigger on _test_ChildSimple__c (after insert, before delete) {
    if (Trigger.isAfter) {
        if (Trigger.isInsert) {
            createNewContactsEvent(Trigger.newMap.keySet());
        }
    }
    if (Trigger.isBefore) {
        if (Trigger.isDelete) {
            createNewContactsEvent(Trigger.oldMap.keySet());
        }
    }

    public static void createNewContactsEvent(Set<Id> contIds) {
        publishGenericEvent(JSON.serialize(new List<Id>(contIds), true));
    }

    private static void publishGenericEvent(String data) {
        Generic_Event__e ge = new Generic_Event__e (
            Data__c = data
        );
        EventBus.publish(ge);
    }
}