/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { WidgetService } from '../../../../base-components/webapp/core/WidgetService';
import { WidgetType } from '../../../../../model/configuration/WidgetType';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { JobFormService, JobDetailsContext } from '../../core';
import { Job } from '../../../model/Job';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { TableFactoryService } from '../../../../base-components/webapp/core/table';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { ContextType } from '../../../../../model/ContextType';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { KIXObject } from '../../../../../model/kix/KIXObject';

class Component extends AbstractMarkoComponent<ComponentState> {

    private subscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.subscriber = {
            eventSubscriberId: 'object-details',
            eventPublished: (data: any, eventId: string) => {
                if (data.objectType === KIXObjectType.JOB) {
                    this.initWidget();
                }
            }
        };
        EventService.getInstance().subscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);

        const context = ContextService.getInstance().getActiveContext();
        if (context) {
            this.state.widgetConfiguration = await context.getWidgetConfiguration(this.state.instanceId);
            this.initWidget();
        }
        this.state.prepared = true;
    }

    public onDestroy(): void {
        EventService.getInstance().unsubscribe(ApplicationEvent.OBJECT_UPDATED, this.subscriber);
    }

    private async initWidget(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const job = await context.getObject<Job>();
        const manager = JobFormService.getInstance().getJobFormManager(job.Type);
        if (manager && manager.supportFilter() && this.state.widgetConfiguration) {
            const title = await TranslationService.translate(this.state.widgetConfiguration.title);
            let count = 0;
            for (const f in job.Filter) {
                if (job.Filter[f] && Array.isArray(job.Filter[f])) {
                    count += job.Filter[f].length;
                }
            }
            this.state.title = `${title} (${count})`;
            await this.prepareTable();
            setTimeout(() => this.state.prepared = true, 50);
        } else {
            this.state.show = false;
        }
    }

    private async prepareTable(): Promise<void> {
        if (this.state.widgetConfiguration) {
            if (!this.state.table) {
                this.state.table = await TableFactoryService.getInstance().createTable(
                    'job-assigned-filter', KIXObjectType.JOB_FILTER,
                    new TableConfiguration(
                        null, null, null, KIXObjectType.JOB_FILTER, null, null, null, null, null, null, null, null,
                        TableHeaderHeight.SMALL, TableRowHeight.SMALL
                    ), null, null, true, false, false, true, true
                );
            } else {
                this.state.table.reload();
            }
        }
    }

}

module.exports = Component;
