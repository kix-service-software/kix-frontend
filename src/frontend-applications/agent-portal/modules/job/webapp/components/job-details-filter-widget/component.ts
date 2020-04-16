/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { JobDetailsContext, JobFormService } from '../../core';
import { Job } from '../../../model/Job';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { TableFactoryService } from '../../../../base-components/webapp/core/table';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { TableHeaderHeight } from '../../../../../model/configuration/TableHeaderHeight';
import { TableRowHeight } from '../../../../../model/configuration/TableRowHeight';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        WidgetService.getInstance().setWidgetType('job-exec-plan-group', WidgetType.GROUP);

        const context = await ContextService.getInstance().getContext<JobDetailsContext>(JobDetailsContext.CONTEXT_ID);
        if (context) {
            this.state.widgetConfiguration = context.getWidgetConfiguration(this.state.instanceId);
            this.initWidget(context);

            context.registerListener('jop-exec-plan-widget', {
                explorerBarToggled: () => { return; },
                filteredObjectListChanged: () => { return; },
                objectListChanged: () => { return; },
                sidebarToggled: () => { return; },
                scrollInformationChanged: () => { return; },
                objectChanged: (id: string | number, job: Job, type: KIXObjectType) => {
                    if (type === KIXObjectType.JOB) {
                        this.initWidget(context);
                    }
                },
                additionalInformationChanged: () => { return; }
            });

        }

        this.state.prepared = true;
    }

    private async initWidget(context: JobDetailsContext): Promise<void> {
        const job = await context.getObject<Job>();
        const manager = JobFormService.getInstance().getJobFormManager(job.Type);
        if (manager && manager.supportFilter()) {
            const title = await TranslationService.translate(this.state.widgetConfiguration.title);
            let count = 0;
            for (const f in job.Filter) {
                if (job.Filter[f]) {
                    count++;
                }
            }
            this.state.title = `${title} (${count})`;
            this.prepareTable();
            this.state.prepared = true;
        } else {
            this.state.show = false;
        }
    }

    private async prepareTable(): Promise<void> {
        if (this.state.widgetConfiguration) {
            this.state.table = await TableFactoryService.getInstance().createTable(
                'job-assigned-filter', KIXObjectType.JOB_FILTER,
                new TableConfiguration(
                    null, null, null, KIXObjectType.JOB_FILTER, null, null, null, null, null, null, null, null,
                    TableHeaderHeight.SMALL, TableRowHeight.SMALL
                ), null, null, true
            );
        }
    }

}

module.exports = Component;
