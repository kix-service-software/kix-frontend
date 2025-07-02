/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';

class ActionComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.action = input.action;
        this.state.displayText = typeof input.displayText !== 'undefined' ? input.displayText : true;
        this.update();
    }

    public async onMount(): Promise<void> {
        this.update();
    }

    private async update(): Promise<void> {
        this.state.text = await TranslationService.translate(this.state.action.text);
        this.state.actionData = await this.state.action.getLinkData();
        this.state.canRunAction = this.state.action.canRun();
    }

    public async doAction(event: any): Promise<void> {
        if (!this.state.canRunAction) return;
        this.state.canRunAction = false;
        (this as any).emit('actionClicked');
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        // enable by timeout if action needs too "long" or results in error
        let runTimeout = setTimeout(() => {
            this.state.canRunAction = true;
            runTimeout = null;
        }, 2000);

        await this.state.action.run(event);
        if (runTimeout) {
            this.state.canRunAction = true;
            clearTimeout(runTimeout);
        }
    }

    public linkClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.doAction(event);
    }

}

module.exports = ActionComponent;
