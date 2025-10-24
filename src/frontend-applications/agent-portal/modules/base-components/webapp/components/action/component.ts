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
import { ApplicationEvent } from '../../core/ApplicationEvent';
import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';

class ActionComponent extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, 'action');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.action = input.action;
        this.state.displayText = typeof input.displayText !== 'undefined' ? input.displayText : true;
        this.update();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.update();

        super.registerEventSubscriber(
            function (contextInstanceId: string, eventId: string): void {
                if (this.context?.instanceId === contextInstanceId) {
                    if (this.state.lockTimeout) {
                        clearTimeout(this.state.lockTimeout);
                        this.state.lockTimeout = null;
                    }
                    if (eventId === ApplicationEvent.UNLOCK_ACTIONS) {
                        this.state.lockRunAction = false;
                    } else if (eventId === ApplicationEvent.LOCK_ACTIONS) {
                        this.state.lockRunAction = true;
                    }
                }
            },
            [
                ApplicationEvent.LOCK_ACTIONS,
                ApplicationEvent.UNLOCK_ACTIONS
            ]
        );
    }

    public onDestroy(): void {
        super.onDestroy();
    }

    private async update(): Promise<void> {
        this.state.text = await TranslationService.translate(this.state.action.text);
        this.state.actionData = await this.state.action.getLinkData();
        this.state.canRunAction = this.state.action.canRun();
    }

    public async doAction(event: any): Promise<void> {
        if (this.state.lockRunAction || !this.state.canRunAction) return;
        this.state.lockRunAction = true;
        (this as any).emit('actionClicked');
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        // enable by timeout if action needs too "long" or results in error
        if (this.state.lockTimeout) {
            clearTimeout(this.state.lockTimeout);
        }
        this.state.lockTimeout = setTimeout(() => {
            this.state.lockRunAction = false;
            this.state.lockTimeout = null;
        }, 5000);

        await this.state.action.run(event);
    }

    public linkClicked(event: any): void {
        event.stopPropagation();
        event.preventDefault();
        this.doAction(event);
    }

}

module.exports = ActionComponent;
