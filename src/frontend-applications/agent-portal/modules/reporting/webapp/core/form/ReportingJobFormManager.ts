/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { ExecPlanTypes } from '../../../../job/model/ExecPlanTypes';
import { Job } from '../../../../job/model/Job';
import { AbstractJobFormManager } from '../../../../job/webapp/core/AbstractJobFormManager';

export class ReportingJobFormManager extends AbstractJobFormManager {

    public supportFilter(): boolean {
        return false;
    }

    public async getPages(job: Job, formInstance: FormInstance): Promise<FormPageConfiguration[]> {
        const execPlanPage = await this.getExecPlanPage(formInstance);
        const actionPage = await this.getMacroPage(job, formInstance);
        return [execPlanPage, actionPage];
    }

    public supportPlan(planType: ExecPlanTypes): boolean {
        return planType === ExecPlanTypes.TIME_BASED;
    }

    protected async getExecPlanPage(formInstance: FormInstance): Promise<FormPageConfiguration> {
        const timeGroup = await this.getTimeGroup(formInstance?.getFormContext());
        return new FormPageConfiguration(
            this.execPageId, 'Translatable#Execution Plan', undefined, undefined, undefined, [timeGroup]
        );
    }

}
