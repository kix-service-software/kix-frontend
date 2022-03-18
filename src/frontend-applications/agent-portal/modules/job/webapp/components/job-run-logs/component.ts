/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TableFactoryService } from '../../../../table/webapp/core/factory/TableFactoryService';
import { JobRun } from '../../../model/JobRun';
import { SortOrder } from '../../../../../model/SortOrder';
import { JobRunLogProperty } from '../../../model/JobRunLogProperty';

class Component {

    private state: ComponentState;
    private jobRun: JobRun;

    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.jobRun = input.jobRun;
    }

    public async onMount(): Promise<void> {
        await this.prepareTable();
    }

    private async prepareTable(): Promise<void> {
        if (this.jobRun) {
            const table = await TableFactoryService.getInstance().createTable(
                'job-run-logs-' + this.jobRun.ID, KIXObjectType.JOB_RUN_LOG, null, null, null, false, false, undefined,
                undefined, undefined, this.jobRun.Logs
            );
            table.sort(JobRunLogProperty.NUMBER, SortOrder.UP);

            this.state.table = table;
        }
    }

}

module.exports = Component;
