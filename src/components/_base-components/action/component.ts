/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

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
        this.state.text = await TranslationService.translate(this.state.action.text);
    }

    public doAction(event: any): void {
        this.state.action.run(event);
    }

}

module.exports = ActionComponent;
