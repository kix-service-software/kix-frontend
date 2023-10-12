/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { MailFilterMatch } from '../../../model/MailFilterMatch';

class Component extends AbstractMarkoComponent {

    public state: ComponentState;

    public async onCreate(input: any): Promise<void> {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.update(input);

        return input;
    }

    private async update(input): Promise<void> {
        if (input.value && typeof input.value === 'object' && (input.value as MailFilterMatch).Value) {
            this.state.value = (input.value as MailFilterMatch).Value;
            this.state.negate = Boolean((input.value as MailFilterMatch).Not);
        } else {
            this.state.value = '';
        }
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.valueTitle = await TranslationService.translate('Translatable#Pattern');
        this.state.negateTitle = await TranslationService.translate('Translatable#Negate');
    }

    public async setCurrentValue(): Promise<void> {
        return;
    }

    public checkboxClicked(event: any): void {
        this.state.negate = event && event.target ? event.target.checked : this.state.negate;
        this.emitChanges();
    }

    public valueChanged(event: any): void {
        this.state.value = event && event.target ? event.target.value : this.state.value;
        this.emitChanges();
    }

    private emitChanges(): void {
        (this as any).emit('change', new MailFilterMatch(null, this.state.value, this.state.negate));
    }
}

module.exports = Component;
