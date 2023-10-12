/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { FormPageConfiguration } from '../../../../../model/configuration/FormPageConfiguration';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';
import { ExecPlanTypes } from '../../../../job/model/ExecPlanTypes';
import { JobProperty } from '../../../../job/model/JobProperty';
import { AbstractJobFormManager } from '../../../../job/webapp/core/AbstractJobFormManager';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { ReportingJobFilterManager } from './ReportingJobFilterManager';

export class ReportingJobFormManager extends AbstractJobFormManager {

    public constructor() {
        super();
        this.filterManager = new ReportingJobFilterManager();
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

    public async prepareCreateValue(
        property: string, formField: FormFieldConfiguration, value: any
    ): Promise<Array<[string, any]>> {
        if (property === JobProperty.FILTER && Array.isArray(value)) {
            value.forEach((v: FilterCriteria) => {

                // backend mostly does not support a list value with equal operator
                if (v.operator === SearchOperator.EQUALS && Array.isArray(v.value)) {
                    v.value = v.value[0];
                }
            });
        }
        return [[property, value]];
    }

}
