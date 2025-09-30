/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { BrowserUtil } from '../../../core/BrowserUtil';
import { IdService } from '../../../../../../model/IdService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private nonWrappedLabel: boolean = false;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.showToggle = typeof input.showToggle !== 'undefined' ? input.showToggle : false;
        if (this.state.showToggle) {
            this.state.toggled = typeof input.toggle !== 'undefined' ? input.toggle : false;
        } else {
            this.state.toggled = false;
        }
        this.state.label = input.label;
        this.state.labelId = IdService.generateDateBasedId(this.state.label?.id ? this.state.label.id.toString() : '');
        this.nonWrappedLabel = input.nonWrappedLabel || false;
    }

    public async onMount(): Promise<void> {
        await this.state.label.init();
        this.state.prepared = true;
        if (!this.nonWrappedLabel) {
            setTimeout(() => {
                this.getLabelValue();

            }, 50);
        }
    }

    public labelClicked(event: any): void {
        if (this.state.showToggle) {
            this.state.toggled = !this.state.toggled;
            event.stopPropagation();
            event.preventDefault();
        } else {
            this.state.toggled = false;
        }
        (this as any).emit('labelClicked', this.state.label, event);
    }

    public removeLabel(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        (this as any).emit('removeLabel', this.state.label, event);
    }

    public getLabelValue(): void {
        BrowserUtil.wrapLinksAndEmailsAndAppendToElement(this.state.labelId, this.state.label.text);
    }
}

module.exports = Component;
