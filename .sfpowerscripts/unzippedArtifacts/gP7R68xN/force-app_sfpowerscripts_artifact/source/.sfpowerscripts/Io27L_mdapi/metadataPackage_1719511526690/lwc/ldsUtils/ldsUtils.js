import GEN_ERROR from '@salesforce/label/c.GEN_ERROR';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

/**
 * Reduces one or more LDS errors into a string[] of error messages.
 * @param {FetchResponse|FetchResponse[]} errors
 * @return {String[]} Error messages
 */
export function reduceErrors(errors) {
    if (!Array.isArray(errors)) {
        errors = [errors];
    }

    return (
        errors
            // Remove null/undefined items
            .filter(error => !!error)
            // Extract an error message
            .map(error => {
                // UI API read errors
                if (Array.isArray(error.body)) {
                    return error.body.map(e => e.message);
                }
                // Enhanced error type
                else if (error.body && error.body.enhancedErrorType 
                        && error.body.output) {
                    if (Array.isArray(error.body.output.errors) && error.body.output.errors.length) {
                        return error.body.output.errors.map(e => e.message);
                    } else if (error.body.output.fieldErrors && Object.keys(error.body.output.fieldErrors).length) {
                        const res = [error.body.message];
                        Object.values(error.body.output.fieldErrors).forEach(fieldErr => {
                            if (Array.isArray(fieldErr)) {
                                fieldErr.forEach(err => {
                                    res.push(err.fieldLabel + ': ' + err.message);
                                });
                            }
                        })
                        return res;
                    }
                }
                // Apex Logger custom exception
                else if (error.body && error.body.message && error.body.message.originMessage) {
                    return enhanceCustomValidationException(error.body.message.originMessage);
                }
                // UI API DML, Apex and network errors
                else if (error.body && typeof error.body.message === 'string') {
                    return enhanceCustomValidationException(error.body.message);
                }
                // JS errors
                else if (typeof error.message === 'string') {
                    return error.message;
                }
                // customized text errors
                else if (typeof error === 'string') {
                    return enhanceCustomValidationException(error);
                }
                // Unknown error shape so try HTTP status text
                return error.statusText;
            })
            // Flatten
            .reduce((prev, curr) => prev.concat(curr), [])
            // Remove empty strings
            .filter(message => !!message)
    );
    
    // enhance custom validation rule exception
    function enhanceCustomValidationException(message) {
        if (message && message.includes('FIELD_CUSTOM_VALIDATION_EXCEPTION')) {
            const leftLimiterPhrase = 'FIELD_CUSTOM_VALIDATION_EXCEPTION';
            const rightLimiterPhrase = ': [';
            const startPos = message.indexOf(leftLimiterPhrase) + leftLimiterPhrase.length;
            const endPos = message.indexOf(rightLimiterPhrase);
            message = endPos > -1 
                ? message.substring(startPos, endPos) 
                : message.substring(startPos);
            message = message.replace(/^[,]+/, '');
        }
        return message;
    }
}

export function makeErrorToastEvent(error, title) {
    let message = reduceErrors(error);
    if (message && Array.isArray(message)) {
        message = message.join(', ');
    }
    return new ShowToastEvent({
        title: title || GEN_ERROR,
        variant: 'error',
        message
    })
}
