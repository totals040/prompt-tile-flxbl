import { api, LightningElement } from 'lwc';
import { subscribe, unsubscribe, onError } from 'lightning/empApi';

export default class ChangeDataCaptureService extends LightningElement {

    subscription = {};

    /**
     * Subscribe on platform event Change Data Capture
     * 
     * @param {*} { objectApiName, channel }  provide either objectApiName or channel to subscribe on change data capture event
     */
    @api subscribe({ objectApiName, channel }) {
        channel = channel || (objectApiName && '/data/' + objectApiName.replace('__c', '') + (objectApiName.endsWith('__c') ? '__ChangeEvent' : 'ChangeEvent'));
        if (channel) {
            this.subscribeOnChangeEvent(channel);
            this.registerErrorListener();
        }
    }

    @api debugMode;

    disconnectedCallback() {
        this.unsubscribeFromChangeEvent();
    }

    subscribeOnChangeEvent(channel) {
        const messageCallback = (response) => {
            this.handleNotificationOnChangeEvent(response);
        };

        subscribe(channel, -1, messageCallback)
        .then(response => {
            if (this.debugMode) {
                console.debug(':: subscribed to channel: ', response.channel);
            }
            this.subscription = response;
        })
        .catch(error => {
            if(this.debugMode) {
                console.debug(':: error on subscribe to change event:', error);
            }
        });
    }

    unsubscribeFromChangeEvent() {
        unsubscribe(this.subscription, response => {
            if (this.debugMode) {
                console.debug(':: unsubscribe response: ', response);
            }
        });
    }

    registerErrorListener() {
        onError(error => {
            if (this.debugMode) {
                console.debug(':: error on change data capture: ', error);
            }
        });
    }

    handleNotificationOnChangeEvent(response) {
        if (this.debugMode) {
            console.debug(':: response on change data capture event: ', response);
        }
        if (response.hasOwnProperty('data') && response.data.hasOwnProperty('payload')) {
            let payload = response.data.payload;
            this.dispatchEvent(new CustomEvent('capturechange', { detail: payload }));
        }
    }
}