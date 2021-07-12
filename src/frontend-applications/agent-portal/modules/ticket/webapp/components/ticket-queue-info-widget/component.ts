/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { QueueLabelProvider, QueueDetailsContext } from '../../core';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { Queue } from '../../../model/Queue';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ActionFactory } from '../../../../../modules/base-components/webapp/core/ActionFactory';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new QueueLabelProvider();
        const context = ContextService.getInstance().getActiveContext();
        context.registerListener('ticket-queue-info-widget', {
            sidebarRightToggled: () => { return; },
            sidebarLeftToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (queueId: string, queue: Queue, type: KIXObjectType) => {
                if (type === KIXObjectType.QUEUE) {
                    this.initWidget(queue);
                }
            },
            additionalInformationChanged: () => { return; }
        });
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        this.initWidget(await context.getObject<Queue>());
    }

    private async initWidget(queue: Queue): Promise<void> {
        this.state.queue = queue;
        this.setActions();
    }

    private async setActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.queue) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.queue]
            );
        }
    }

}

module.exports = Component;
