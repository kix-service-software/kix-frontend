/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';

class HomeComponent extends AbstractMarkoComponent {

    public state: ComponentState;

    public onCreate(input: any): void {
        super.onCreate(input, 'home-module');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.prepareWidgets();

        super.registerEventSubscriber(
            function (data: any): void {
                if (data?.contextId === this.context.contextId) {
                    this.prepareWidgets();
                }
            },
            [ContextEvents.CONTEXT_USER_WIDGETS_CHANGED]
        );
    }

    private async prepareWidgets(): Promise<void> {
        this.state.prepared = false;
        setTimeout(async () => {
            this.state.contentWidgets = await this.context?.getContent() || [];
            this.state.prepared = true;
        }, 100);
    }


    public onDestroy(): void {
        super.onDestroy();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = HomeComponent;
