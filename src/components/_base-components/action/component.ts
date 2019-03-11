import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

class ActionComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.action = input.action;
        this.state.displayText = typeof input.displayText !== 'undefined' ? input.displayText : true;
    }

    public async onMount(): Promise<void> {
        if (this.state.displayText) {
            this.state.text = await TranslationService.translate(this.state.action.text);
        }
    }

    public doAction(event: any): void {
        this.state.action.run(event);
    }

}

module.exports = ActionComponent;
