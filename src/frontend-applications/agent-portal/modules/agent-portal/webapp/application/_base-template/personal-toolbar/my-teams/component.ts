/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectLoadingOptions } from '../../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../../model/kix/KIXObjectType';
import { KIXStyle } from '../../../../../../base-components/model/KIXStyle';
import { AbstractMarkoComponent } from '../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ApplicationEvent } from '../../../../../../base-components/webapp/core/ApplicationEvent';
import { ContextService } from '../../../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../../base-components/webapp/core/KIXObjectService';
import { LabelService } from '../../../../../../base-components/webapp/core/LabelService';
import { Queue } from '../../../../../../ticket/model/Queue';
import { TicketContext } from '../../../../../../ticket/webapp/core';
import { TranslationService } from '../../../../../../translation/webapp/core/TranslationService';
import { PersonalSettingsProperty } from '../../../../../../user/model/PersonalSettingsProperty';
import { AgentService } from '../../../../../../user/webapp/core/AgentService';
import { ComponentState } from './ComponentState';
import { QueueInformation } from './QueueInformation';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, 'personal-toolbar/my-teams');
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#My Queues'
        ]);

        await this.initQueues();

        super.registerEventSubscriber(this.initQueues, [ApplicationEvent.REFRESH_TOOLBAR]);

        window.addEventListener('resize', this.resizeHandling.bind(this), false);
        this.resizeHandling();
    }

    public onDestroy(): void {
        super.onDestroy();
        window.removeEventListener('resize', this.resizeHandling.bind(this), false);
    }

    private async initQueues(): Promise<void> {
        this.state.prepared = false;
        const user = await AgentService.getInstance().getCurrentUser();
        const myQueues = user.Preferences.find((p) => p.ID === PersonalSettingsProperty.MY_QUEUES);
        const myQueueValue = Array.isArray(myQueues?.Value)
            ? myQueues?.Value
            : isNaN(Number(myQueues?.Value)) ? [] : [myQueues?.Value];

        if (myQueueValue?.length) {
            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.includes = ['TicketStats'];
            loadingOptions.query.push(['TicketStats.StateType', 'Open']);
            const queues = await KIXObjectService.loadObjects<Queue>(
                KIXObjectType.QUEUE, myQueueValue, loadingOptions
            ).catch((): Queue[] => []);

            this.state.queues = [];
            for (const queue of queues) {
                const name = await LabelService.getInstance().getObjectText(queue);
                const icon = LabelService.getInstance().getObjectIcon(queue);

                const queueInfo = new QueueInformation(queue.QueueID, name, icon, queue.TicketStats?.TotalCount || 0);
                this.state.queues.push(queueInfo);
            }
            setTimeout(() => this.state.prepared = true, 50);
        }
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
