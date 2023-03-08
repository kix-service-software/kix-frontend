/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Job } from '../../model/Job';
import { JobProperty } from '../../model/JobProperty';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { Macro } from '../../model/Macro';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { ExecPlan } from '../../model/ExecPlan';
import { JobService } from '.';
import { JobType } from '../../model/JobType';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class JobLabelProvider extends LabelProvider {

    public kixObjectType: KIXObjectType = KIXObjectType.JOB;

    public isLabelProviderFor(object: Job | KIXObject): boolean {
        return object instanceof Job || object?.KIXObjectType === this.kixObjectType;
    }

    public async getObjectText(
        job: Job, id?: boolean, title?: boolean, translatable?: boolean
    ): Promise<string> {
        return job.Name;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue;
        switch (property) {
            case JobProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case JobProperty.TYPE:
                displayValue = 'Translatable#Type';
                break;
            case JobProperty.HAS_TRIGGER_EVENTS:
                displayValue = 'Translatable#Event Based';
                break;
            case JobProperty.HAS_TRIGGER_TIMES:
                displayValue = 'Translatable#Time Based';
                break;
            case JobProperty.ACTION_COUNT:
                displayValue = 'Translatable#Number of Actions';
                break;
            case JobProperty.LAST_EXEC_TIME:
                displayValue = 'Translatable#Last executed at';
                break;
            default:
                displayValue = await super.getPropertyText(property, false, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getPropertyValueDisplayText(
        property: string, value: any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case JobProperty.LAST_EXEC_TIME:
                if (value) {
                    displayValue = translatable ?
                        await DateTimeUtil.getLocalDateTimeString(displayValue) : displayValue;
                }
                break;
            case JobProperty.TYPE:
                if (value) {
                    const jobTypes = await KIXObjectService.loadObjects<JobType>(
                        KIXObjectType.JOB_TYPE, undefined, undefined, undefined, true
                    ).catch(() => [] as JobType[]);
                    if (jobTypes && jobTypes.length) {
                        const type = jobTypes.find((t) => t.Name === value);
                        if (type) {
                            displayValue = type.DisplayName;
                        }
                    }
                }
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }
        return displayValue ? displayValue.toString() : '';
    }

    public async getDisplayText(
        job: Job, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = typeof defaultValue !== 'undefined' && defaultValue !== null
            ? defaultValue : job[property];

        const existingValue = job.displayValues.find((dv) => dv[0] === property);
        if (existingValue) {
            displayValue = existingValue[1];
        } else {
            switch (property) {
                case JobProperty.ACTION_COUNT:
                    translatable = false;
                    displayValue = 0;
                    let macros: Macro[] = [];
                    if (Array.isArray(job.Macros) && !!job.Macros.length) {
                        macros = job.Macros;
                    } else if (Array.isArray(job.MacroIDs) && !!job.MacroIDs.length) {
                        macros = await KIXObjectService.loadObjects<Macro>(
                            KIXObjectType.MACRO, job.MacroIDs,
                            new KIXObjectLoadingOptions(undefined, undefined, undefined, ['Actions']),
                            undefined, true
                        ).catch(() => [] as Macro[]);
                    }
                    if (macros) {
                        macros.forEach((m) => {
                            if (Array.isArray(m.Actions)) {
                                displayValue += m.Actions.length;
                            } else {
                                displayValue += m.ExecOrder ? m.ExecOrder.length : 0;
                            }
                        });
                    }
                    break;
                case JobProperty.HAS_TRIGGER_EVENTS:
                    const eventExecPlans: ExecPlan[] = await JobService.getExecPlansOfJob(job);
                    const hasEvents: boolean = eventExecPlans && eventExecPlans.some(
                        (ep) => ep.Parameters && Array.isArray(ep.Parameters.Event) && !!ep.Parameters.Event.length
                    );
                    displayValue = hasEvents ? 'Translatable#Yes' : 'Translatable#No';
                    break;
                case JobProperty.HAS_TRIGGER_TIMES:
                    const timeExecPlans: ExecPlan[] = await JobService.getExecPlansOfJob(job);
                    const hasTimes: boolean = timeExecPlans && timeExecPlans.some(
                        (ep) => ep.Parameters
                            && Array.isArray(ep.Parameters.Weekday) && !!ep.Parameters.Weekday.length
                            && Array.isArray(ep.Parameters.Time) && !!ep.Parameters.Time.length
                    );
                    displayValue = hasTimes ? 'Translatable#Yes' : 'Translatable#No';
                    break;
                default:
                    displayValue = await this.getPropertyValueDisplayText(property, displayValue, translatable);
            }
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getIcons(job: Job, property: string, value?: string | number): Promise<Array<string | ObjectIcon>> {
        const icons = [];
        if (property === JobProperty.HAS_TRIGGER_EVENTS || property === JobProperty.HAS_TRIGGER_TIMES) {
            if (job) {
                let execPlans: ExecPlan[] = [];
                if (Array.isArray(job.ExecPlans) && !!job.ExecPlans.length) {
                    execPlans = job.ExecPlans;
                } else if (Array.isArray(job.ExecPlanIDs) && !!job.ExecPlanIDs.length) {
                    execPlans = await KIXObjectService.loadObjects<ExecPlan>(
                        KIXObjectType.EXEC_PLAN, job.ExecPlanIDs, undefined, null, true
                    ).catch(() => [] as ExecPlan[]);
                }

                if (property === JobProperty.HAS_TRIGGER_EVENTS) {
                    const hasEvents: boolean = execPlans && !!execPlans.length && execPlans.some(
                        (ep) => ep.Parameters && Array.isArray(ep.Parameters.Event) && !!ep.Parameters.Event.length
                    );
                    if (hasEvents) {
                        icons.push('kix-icon-check');
                    }
                } else if (property === JobProperty.HAS_TRIGGER_TIMES) {
                    const hasTimes: boolean = execPlans && !!execPlans.length && execPlans.some(
                        (ep) => ep.Parameters
                            && Array.isArray(ep.Parameters.Weekday) && !!ep.Parameters.Weekday.length
                            && Array.isArray(ep.Parameters.Time) && !!ep.Parameters.Time.length
                    );
                    if (hasTimes) {
                        icons.push('kix-icon-check');
                    }
                }
            } else if (value && value === 'Yes') {
                icons.push('kix-icon-check');
            } else if (value && value === 'No') {
                icons.push('kix-icon-close');
            }
        }

        return icons;
    }

}
