import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../core/browser';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.cancelCallback = input.cancelCallback;
        this.state.time = input.time;
    }

    public async update(): Promise<void> {
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
