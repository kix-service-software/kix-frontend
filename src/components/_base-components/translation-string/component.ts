import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../core/browser';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';
import { EventService } from '../../../core/browser/event';
import { ApplicationEvent } from '../../../core/browser/application';

class Component extends AbstractMarkoComponent<ComponentState> {

    private pattern: string = '';
    private placeholders: string[] = [];

    public onCreate(): void {
        this.state = new ComponentState();
        this.pattern = '';
        this.placeholders = [];
    }

    public onInput(input: any): void {
        const placeholders = typeof input.placeholders !== 'undefined' ? input.placeholders : [];
        if (this.pattern !== input.pattern || this.placeholdersChanged(placeholders)) {
            this.placeholders = placeholders;
            this.pattern = input.pattern;
            this.setText();
        }
    }

    private placeholdersChanged(placeholders: string[]): boolean {
        if (placeholders.length !== this.placeholders.length) {
            return true;
        }

        for (let i = 0; i < placeholders.length; i++) {
            if (placeholders[i] !== this.placeholders[i]) {
                return true;
            }
        }

        return false;
    }

    public async onMount(): Promise<void> {
        await this.setText();
        EventService.getInstance().subscribe(ApplicationEvent.REFRESH, {
            eventSubscriberId: '',
            eventPublished: () => {
                this.setText();
            }
        });
    }

    private async setText(): Promise<void> {
        this.state.text = await TranslationService.translate(this.pattern, this.placeholders);
    }

}

module.exports = Component;
