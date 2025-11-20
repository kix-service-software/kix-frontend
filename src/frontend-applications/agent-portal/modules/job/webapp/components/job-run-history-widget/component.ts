/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { ActionFactory } from '../../../../base-components/webapp/core/ActionFactory';
import { Job } from '../../../model/Job';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.state.widgetConfiguration = await this.context?.getWidgetConfiguration(this.state.instanceId);

        this.context?.registerListener('job-run-history-widget', {
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

        await this.initWidget(await this.context?.getObject<Job>());
    }

    private async initWidget(job: Job): Promise<void> {
        if (job) {
            this.state.prepared = false;
            this.prepareActions(job);
            await this.prepareTable();

            setTimeout(() => this.state.prepared = true, 50);
        }
    }

    private async prepareActions(job: Job): Promise<void> {
        if (this.state.widgetConfiguration && job) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [job], this.contextInstanceId
            );
        }
    }

    private async prepareTable(): Promise<void> {
        const table = await TableFactoryService.getInstance().createTable(
            'job-run-history', KIXObjectType.JOB_RUN, null, null, this.contextInstanceId
        );
        this.state.table = table;
    }

    public filter(filterValue: string): void {
        this.state.table.setFilter(filterValue);
        this.state.table.filter();
    }


    public onDestroy(): void {
        super.onDestroy();
    }
}

module.exports = Component;
