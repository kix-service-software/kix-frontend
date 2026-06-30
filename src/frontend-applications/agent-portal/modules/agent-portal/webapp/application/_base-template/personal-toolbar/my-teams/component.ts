/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXStyle } from '../../../../../../base-components/model/KIXStyle';
import { AbstractMarkoComponent } from '../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../../../base-components/webapp/core/ContextService';
import { TicketContext } from '../../../../../../ticket/webapp/core';
import { TranslationService } from '../../../../../../translation/webapp/core/TranslationService';
import { ComponentState } from './ComponentState';
import { MyTeamsEventHandler } from './MyTeamsEventHandler';
import { QueueInformation } from './QueueInformation';

class Component extends AbstractMarkoComponent<ComponentState> {

    private myTeamsEventHandler: MyTeamsEventHandler;

    public onCreate(input: any): void {
        super.onCreate(input, 'personal-toolbar/my-teams');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#My Queues'
        ]);

        this.myTeamsEventHandler = new MyTeamsEventHandler(
            (queueInformation: QueueInformation[]) => {
                this.state.prepared = false;
                this.state.queues = queueInformation;
                setTimeout(() => this.state.prepared = true, 50);
            }
        );

        this.myTeamsEventHandler.init();

        window.addEventListener('resize', this.resizeHandling.bind(this), false);
        this.resizeHandling();
    }

    public onDestroy(): void {
        super.onDestroy();
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
        this.myTeamsEventHandler?.destroy();
    }

    public async queueClicked(queueInfo: QueueInformation): Promise<void> {
        const context = await ContextService.getInstance().setActiveContext(TicketContext.CONTEXT_ID) as TicketContext;
        context.setQueue(queueInfo.queueId);
    }

    public async openMyTeams(): Promise<void> {
        const context = await ContextService.getInstance().setActiveContext(TicketContext.CONTEXT_ID) as TicketContext;
        context.setQueue(0);
    }

    private resizeHandling(): void {
        this.state.isMobile = Boolean(window.innerWidth <= KIXStyle.MOBILE_BREAKPOINT);
    }


    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
