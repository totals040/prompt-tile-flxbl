import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { RefreshEvent } from 'lightning/refresh';
import { MessageContext, releaseMessageContext, subscribe } from 'lightning/messageService';
import CORE_MESSAGE_CHANNEL from '@salesforce/messageChannel/CoreMessageChannel__c';

import SR_PLACEHOLDER from '@salesforce/label/c.SR_InptPlchldr';
import { reduceErrors } from 'c/ldsUtils';

import getRecords from '@salesforce/apex/PromptTileController.getRecords';

import { deleteRecord, createRecord } from 'lightning/uiRecordApi';

const PLATFORM_EVENT = 'Platform Event';
const MESSAGE_CHANNEL = 'Message Channel';
const CHANGE_DATA_CAPTURE = 'Change Data Capture';

export default class PromptTile extends LightningElement {
    @api recordId;
    @api objectApiName;

    @api headerTitle;
    @api childRelApiName;
    @api fldApiName;
    @api parentRelLibApiName;
    @api refreshViewChannel;
    @api fixedWidth;

    @track pills;
    @track error;

    childObjectInfo;
    childRelInfo;

    get isPlatformEventEnabled() { return this.refreshViewChannel === PLATFORM_EVENT; }
    get isMessageChannelEnabled() { return this.refreshViewChannel === MESSAGE_CHANNEL; }
    get isChangeDataCaptureEnabled() { return this.refreshViewChannel === CHANGE_DATA_CAPTURE; }
    get parentEntityForChangeDataCapture() { return this.isChangeDataCaptureEnabled ? this.objectApiName : undefined; }

    get childObjectApiName() { return this.childRelInfo?.childObjectApiName; }

    get title() { return this.headerTitle || this.childObjectInfo?.labelPlural }
    get placeholder() { return SR_PLACEHOLDER; }
    get isLookupMode() { return this.parentRelLibApiName; }

    @wire(MessageContext)
    messageContext;

    @wire(getObjectInfo, { objectApiName: '$objectApiName' })
    setContextObjectInfo({data, error}) {
        if (data) {
            console.debug('OBJ data: ', data);
            this.childRelInfo = data.childRelationships.find(childRel => childRel.relationshipName === this.childRelApiName);
            console.debug('childRelInfo: ', this.childRelInfo);
            if (this.childObjectApiName && this.isChangeDataCaptureEnabled) { 
                this.template.querySelector('c-change-data-capture-service')?.subscribe({ objectApiName : this.childObjectApiName });
            }
        } else if (error) {
            console.debug(':: error get contect object info:', error);
        }
    }

    @wire(getObjectInfo, { objectApiName: '$childObjectApiName' })
    setChildObjectInfo({data, error}) {
        if (data) {
            console.debug('child OBJ data: ', data);
            this.childObjectInfo = data;
        } else if (error) {
            console.debug(':: error get contect object info:', error);
        }
    }

    connectedCallback() {
        this.setMode();
        this.fetchRecords();
        if (this.isMessageChannelEnabled && !this.subscription) {
            this.subscription = subscribe(this.messageContext, CORE_MESSAGE_CHANNEL, this.handleCoreMessage.bind(this));
        }
    }

    disconnectedCallback() {
        if (this.messageContext) { 
            releaseMessageContext(this.messageContext);
        }
    }

    renderedCallback() {
        if (this.fixedWidth !== undefined && this.fixedWidth !== null ) {
            this.setFixedWidth(this.fixedWidth);
        }
    }

    handleCaptureChange() {
        this.fetchRecords();
    }

    handleConnectorReady(event) {
		event.target.subscribe();
	}

    handleConnectorMessage() {
        this.fetchRecords();
	}

    handleCoreMessage(message) {
        if (message) {
            this.fetchRecords();
        }
    }

    async fetchRecords() {
        const paramStr = JSON.stringify(
            {
                labelFldName: this.fldApiName
                , childRelApiName: this.childRelApiName
                , parentIdStr: this.recordId
                , parentRelLibApiName: this.parentRelLibApiName
            }
        );
        const result = await getRecords( { paramStr }).catch(error => {
            window.console.log('Error when fetching records from controller ', error.body.message);
            this.setErrorMessage(error.body.message);
        });
        if (this.isNoError()) {
            this.pills = result.map(obj => {
                const label = this.mode.setLabel(obj);
                return {obj, label};
            });
        }
        this.loadingOff();
    }

    onCheckSubmit(event) {
        this.clearErrorMessage();
        this.createInDatabaseAndFetch(event);
        
    }

    onDelete(event) {
        this.clearErrorMessage();
        let recId = event.target.dataset.recordid;
        this.deleteInDatabaseAndFetch(recId);
    }

    async createInDatabaseAndFetch(event) {
        if (event.keyCode !== 13 && ! this.isLookupMode) { return; }
        const newValue = event.target.value;
        if ( ! newValue || ! newValue.match(/\S/) || this.isDuplicateValue(newValue)) { return; }
        this.loadingOn();
        const fields = {};
        fields[this.childRelInfo.fieldName] = this.recordId;
        this.mode.setValue(fields, newValue);
        this.mode.resetEntry(event);         
        await createRecord({apiName: this.childRelInfo.childObjectApiName, fields}).catch(error => {
            window.console.log('Error when creating records ', error.body);
            this.setErrorMessage(error.body.message);
        });
        if (this.isNoError()) {
            this.fetchRecords();
            this.dispatchEvent(new RefreshEvent());
        } 
    }
           

    async deleteInDatabaseAndFetch(recId) {
        this.loadingOn();
        await deleteRecord(recId).catch(error => {
            window.console.log('Error when removing records ', error.body.message);
            this.setErrorMessage(error.body.message);
        });
        if (this.isNoError()) {
            this.fetchRecords();
        }
    }


    //set fixedWidth style
    setFixedWidth(widthValue) {
        let slicedNumberString;
        if ((widthValue.endsWith('vw') && widthValue !== 'vw') || (widthValue.endsWith('px') && widthValue !== 'px')) {
            slicedNumberString = widthValue.slice(0,-2);
        } else if (widthValue.endsWith('rem') && widthValue !== 'rem') {
            slicedNumberString = widthValue.slice(0,-3);
        }
        if (!isNaN(slicedNumberString) && slicedNumberString.indexOf(' ') === -1) {
            console.debug('...set fixed width value: ', widthValue); 
            const articleElement = this.template.querySelector('article');
            const inputFieldElement = articleElement.querySelector('div.inputSearch > lightning-record-edit-form').querySelector('lightning-input-field.inputField');
            inputFieldElement.style.width = widthValue;
        }
    }


    //  ***** Low level Helpers ****** //

    setErrorMessage(msg) {
        this.error = reduceErrors(msg);
        this.loadingOff();
    }

    clearErrorMessage() {
        this.error = null;
    }

    isNoError() {
        return this.error === null || this.error === undefined;
    }

    isDuplicateValue(newValue) {
        return this.pills.some(relObj => relObj.obj[this.mode.getFieldName()] === newValue);
    }

    loadingOn() {
        this.template.querySelector('.id-spinner')?.classList.remove('slds-hide');
    }

    loadingOff() {
        this.template.querySelector('.id-spinner')?.classList.add('slds-hide');
    }

    setMode() {
        const isLookup = !! this.parentRelLibApiName;
        const relName = this.parentRelLibApiName?.slice(-3) === '__c' ? this.parentRelLibApiName?.replace('__c', '__r') : 
                        this.parentRelLibApiName?.slice(-2) === 'Id' ? this.parentRelLibApiName?.replace('Id', '') : this.parentRelLibApiName;
        const lookupMode = {
            setValue: (fields, value) => { fields[this.parentRelLibApiName] = value; }
            , setLabel: obj => obj[relName][this.fldApiName]
            , resetEntry: ev => { ev.target.reset(); }
            , getFieldName: () => this.parentRelLibApiName.replace('__r', '__c')
        }
        const tagMode = {
            setValue: (fields, value) => { fields[this.fldApiName] = value; }
            , setLabel: obj => obj[this.fldApiName]
            , resetEntry: ev => { ev.target.value = null; }
            , getFieldName: () => this.fldApiName
        }
        this.mode = isLookup ? lookupMode : tagMode;
    }

}