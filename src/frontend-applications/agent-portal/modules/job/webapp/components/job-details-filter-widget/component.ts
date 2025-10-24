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
import { Job } from '../../../model/Job';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';
import { ApplicationEvent } from '../../../../base-components/webapp/core/ApplicationEvent';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { JobFormService } from '../../core/JobFormService';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input, 'job-details-filter-widget');
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();

        super.registerEventSubscriber(
            function (data: any, eventId: string): void {
                if (data.objectType === KIXObjectType.JOB) {
                    this.initWidget();
                }
            },
            [ApplicationEvent.OBJECT_UPDATED]
        );

        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);
        this.initWidget();
        this.state.prepared = true;
    }

    private async initWidget(): Promise<void> {
        const job = await this.context?.getObject<Job>();
        const manager = JobFormService.getInstance().getJobFormManager(job.Type);
        if (manager?.supportFilter() && this.state.widgetConfiguration) {
            this.state.title = this.state.widgetConfiguration.title;
            await this.prepareFilter(job);
            await this.prepareSort(job);
        } else {
            this.state.show = false;
        }
    }

    private async prepareFilter(job: Job): Promise<void> {
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
    }

    private async prepareSort(job: Job): Promise<void> {
        if (job.SortOrder?.Field) {
            this.state.sortDescending = Boolean(job.SortOrder?.Direction === 'descending');
            this.state.sortDescendingTooltip = await TranslationService.translate(
                this.state.sortDescending ? 'Translatable#descending' : 'Translatable#ascending'
            );

            this.state.sortAttribute = await LabelService.getInstance().getPropertyText(
                job.SortOrder.Field, job.Type
            );
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
                ), [filterIndex], this.context.instanceId, true, false, false, true, true, null, false
            );
        }
        return table;
    }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
