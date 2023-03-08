/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../../modules/base-components/webapp/core/ApplicationEvent';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';

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
            eventPublished: (): void => {
                this.setText();
            }
        });
    }

    private async setText(): Promise<void> {
        this.state.text = await TranslationService.translate(this.pattern, this.placeholders);
    }

}

module.exports = Component;
