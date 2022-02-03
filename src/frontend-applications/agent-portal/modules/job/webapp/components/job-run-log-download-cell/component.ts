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
import { JobRun } from '../../../model/JobRun';
import { TranslationService } from '../../../../translation/webapp/core/TranslationService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { JobRunLogProperty } from '../../../model/JobRunLogProperty';
import { SortOrder } from '../../../../../model/SortOrder';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { Job } from '../../../model/Job';
import { DateTimeUtil } from '../../../../base-components/webapp/core/DateTimeUtil';
import { Cell } from '../../../../table/model/Cell';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { TableExportUtil } from '../../../../table/webapp/core/TableExportUtil';

class Component extends AbstractMarkoComponent<ComponentState> {

    private jobRun: JobRun;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        if (input.cell) {
            const cell: Cell = input.cell;
            const jobRun: JobRun = cell.getRow().getRowObject().getObject();
            this.update(jobRun);
        }
    }

    private async update(jobRun: JobRun): Promise<void> {
        this.jobRun = null;
        if (jobRun && jobRun instanceof JobRun) {
            this.jobRun = jobRun;
            this.state.title = await TranslationService.translate('Translatable#Download log');
            this.state.show = true;
        }
    }

    public async downloadLog(event: any): Promise<void> {
        event.stopPropagation();
        event.preventDefault();

        if (this.jobRun) {
            const table = await TableFactoryService.getInstance().createTable(
                'job-run-logs-' + this.jobRun.ID, KIXObjectType.JOB_RUN_LOG, null, null, null, false, false, undefined,
                undefined, undefined, this.jobRun.Logs
            );
            table.sort(JobRunLogProperty.NUMBER, SortOrder.UP);
            await table.initialize();

            let fileName;
            const context = ContextService.getInstance().getActiveContext();
            if (context) {
                const job = await context.getObject<Job>();
                if (job) {
                    fileName = `${job.Name}_Run_${this.jobRun.ID}`;
                }
            }

            if (!fileName) {
                fileName = `Job_${this.jobRun.JobID}_Run_${this.jobRun.ID}`;
            }

            const dateString = DateTimeUtil.getTimestampNumbersOnly(new Date(this.jobRun.StartTime));
            fileName += `_${dateString}`;

            TableExportUtil.export(table, undefined, false, false, false, true, fileName, false);
        }
    }

}

module.exports = Component;
