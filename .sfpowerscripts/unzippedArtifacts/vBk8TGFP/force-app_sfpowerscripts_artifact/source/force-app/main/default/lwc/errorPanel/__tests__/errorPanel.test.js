import { createElement } from 'lwc';
import ErrorPanel from 'c/errorPanel';

describe('c-error-panel', () => {
    afterEach(() => {
        // The jsdom instance is shared across test cases in a single file so reset the DOM
        while (document.body.firstChild) {
            document.body.removeChild(document.body.firstChild);
        }
    });

    it('is accessible', () => {
        const element = createElement('c-error-panel', {
            is: ErrorPanel
        });
        document.body.appendChild(element);
        // Check accessibility
        expect(element).toBeTruthy();
    });

    const ERROR_MESSAGE = 'Unavailable';
    it('should display error message', () => {
        const element = createElement('c-error-panel', {
            is: ErrorPanel
        });
        element.errors = ERROR_MESSAGE;
        document.body.appendChild(element);
        
        const errorMessage = element.shadowRoot.querySelector('.errorArea');
        expect(errorMessage.textContent).toBe(ERROR_MESSAGE);
    });
});