/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { JobFormService } from '../../core';
import { Job } from '../../../model/Job';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';

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
            eventPublished: (data: any, eventId: string): void => {
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
            this.state.title = this.state.widgetConfiguration.title;
            if (Array.isArray(job.Filter)) {
                const tablePromises = [];
                job.Filter.forEach((orFilter, index) => {
                    if (typeof orFilter === 'object') {
                        tablePromises.push(this.prepareTable(job.ID, index));
                    }
                });
                this.state.tables = (await Promise.all(tablePromises)).filter((t) => t);
                setTimeout(() => this.state.prepared = true, 50);
            }
        } else {
            this.state.show = false;
        }
    }

    private async prepareTable(jobId: number, filterIndex: number): Promise<void> {
        let table;
        if (this.state.widgetConfiguration) {
            table = await TableFactoryService.getInstance().createTable(
                `job-assigned-filter-${jobId}-${filterIndex}`, KIXObjectType.JOB_FILTER,
                new TableConfiguration(
                    null, null, null, KIXObjectType.JOB_FILTER, null, null, null, null, null, null, null, null,
                    TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ), [filterIndex], null, true, false, false, true, true
            );
        }
        return table;
    }

}

module.exports = Component;
