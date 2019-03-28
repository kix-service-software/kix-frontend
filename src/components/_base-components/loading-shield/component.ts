import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../core/browser';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        this.state.cancelCallback = input.cancelCallback;
        this.state.time = input.time;
        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);
    }

    public cancel(): void {
        if (this.state.cancelCallback) {
            this.state.cancelCallback();
            this.state.cancel = true;
        }
    }

}

module.exports = Component;
