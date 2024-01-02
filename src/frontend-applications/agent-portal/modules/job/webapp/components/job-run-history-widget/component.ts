/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { JobDetailsContext } from '../../core/context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { ActionFactory } from '../../../../base-components/webapp/core/ActionFactory';
import { Job } from '../../../model/Job';
import { SortOrder } from '../../../../../model/SortOrder';
import { JobRunProperty } from '../../../model/JobRunProperty';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        this.state.widgetConfiguration = context
            ? await context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        context.registerListener('job-run-history-widget', {
            sidebarLeftToggled: (): void => { return; },
            filteredObjectListChanged: (): void => { return; },
            objectListChanged: () => { return; },
            sidebarRightToggled: (): void => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: (jobId: string, job: Job, type: KIXObjectType) => {
                if (type === KIXObjectType.JOB) {
                    this.initWidget(job);
                }
            },
            additionalInformationChanged: (): void => { return; }
        });

        await this.initWidget(await context.getObject<Job>());
    }

    private async initWidget(job: Job): Promise<void> {
        if (job) {
            this.prepareActions(job);
            await this.prepareTable();
        }
    }

    private async prepareActions(job: Job): Promise<void> {
        if (this.state.widgetConfiguration && job) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [job]
            );
        }
    }

    private async prepareTable(): Promise<void> {
        const table = await TableFactoryService.getInstance().createTable(
            'job-run-history', KIXObjectType.JOB_RUN, null, null, JobDetailsContext.CONTEXT_ID
        );
        table.sort(JobRunProperty.START_TIME, SortOrder.UP);

        this.state.table = table;
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }

}

module.exports = Component;
