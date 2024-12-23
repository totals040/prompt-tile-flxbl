@isTest
public class UtilityTest {
    @isTest
    private static void itShouldFireGenericEvent() {
        Test.startTest();
        String eventId = Utility.publishPlatformEvent('OK', 'Test_message');
        Test.stopTest();

        Assert.isNotNull(eventId, 'it should fire a Generic event');
    }
}