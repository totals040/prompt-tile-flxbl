import { LightningElement, api } from 'lwc';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';

import publishPlatformEvent from '@salesforce/apex/Utility.publishPlatformEvent';

/**
 * Holds emp-api services.
 * Custom events:
 *  "ready" - fires if emp-api is enabled
 *  "subscribe" - when successfully subscribed to the channel
 *  "unsubscribe" - when successfully unsubscribed from the channel
 *  "message" - when new message (Platform Event) recieved
 *  "error" - when error occured
 */
export default class PlatformEventsConnector extends LightningElement {
    subscription = {};
    isEmpEnabled = false;

    /**
     * Subscribes to a given channel and fires "subscribe" event on success.
     * @param {String} channelName  the name of the channel. Default value is "/event/Generic_Event__e" 
     */
    @api subscribe(channelName) {
        if (!channelName) {
            channelName = '/event/Generic_Event__e';
        }
        // Callback invoked whenever a new event message is received
        const messageCallback = (response) => {
            console.debug('... emp-api: New message received: ', JSON.stringify(response));
            // Response contains the payload of the new message received
            this.dispatchEvent(new CustomEvent('message', { detail: response }));
        };

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(channelName, -1, messageCallback).then(response => {
            // Response contains the subscription information on subscribe call
            console.debug('... emp-api: Subscription request sent to: ', JSON.stringify(response.channel));
            this.subscription = response;
            this.dispatchEvent(new CustomEvent('subscribe', { detail: response }));
        })
        .catch(error => {
            console.debug('... emp-api: error on subscribe', JSON.stringify(error));
            this.dispatchEvent(new CustomEvent('error', { detail: error }));
        });
    }

    /**
     * Unsubscribes from the channel using the given subscription object (set on subscribe) and fires "unsubscribe" on success.
     */
    @api unsubscribe() {
        unsubscribe(this.subscription, response => {
            console.debug('... emp-api: unsubscribe response: ', JSON.stringify(response));
            // Response is true for successful unsubscribe
            this.dispatchEvent(new CustomEvent('unsubscribe', { detail: response }));
        });
    }

    /**
     * Set to true or false to turn console logging on or off respectively.
     * @param {Boolean} flag    true|false
     */
    @api debug(flag) {
        setDebugFlag(!!flag);
    }

    @api async publish(status, message) {
        const result = await publishPlatformEvent({ status, message }).catch(error => { console.debug('... emp-api: error on publish platform event: ', error); });
        console.debug('... emp-api: result on publish platform event: ', result);
    }

    connectedCallback() {
        isEmpEnabled().then(response => {
            console.debug('... emp-api: isEmpEnabled', JSON.stringify(response));
            if (response) {
                this.dispatchEvent(new CustomEvent('ready'));
                // Register error listener       
                this.registerErrorListener();      
            }
        }).catch(error => {
            console.debug('... emp-api: error on check isEmpEnabled:', error);
            this.dispatchEvent(new CustomEvent('error', { detail: error }));
        })  
    }

    disconnectedCallback() {
        unsubscribe();
    }

    registerErrorListener() {
        // Invoke onError empApi method
        onError(error => {
            console.debug('... emp-api: Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
            this.dispatchEvent(new CustomEvent('error', { detail: error }));
        });
    }
}