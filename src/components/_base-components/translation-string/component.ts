import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../core/browser';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private pattern: string;
    private placeholders: string[];

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.pattern = input.pattern;
        this.placeholders = input.placeholders;
        this.setText();
    }

    public async onMount(): Promise<void> {
        await this.setText();
    }

    private async setText(): Promise<void> {
        this.state.text = await TranslationService.translate(this.pattern, this.placeholders);
    }

}

module.exports = Component;
