/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from "../LabelProvider";
import { JobProperty, KIXObjectType, KIXObjectLoadingOptions, SortUtil, DateTimeUtil } from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { Job } from "../../model/kix/job/Job";
import { KIXObjectService } from "../kix";
import { Macro } from "../../model/kix/macro";
import { ExecPlan } from "../../model/kix/exec-plan";

export class JobLabelProvider extends LabelProvider {

    public kixObjectType: KIXObjectType = KIXObjectType.JOB;

    public isLabelProviderFor(notification: Job): boolean {
        return notification instanceof Job;
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
            case JobProperty.TRIGGER_EVENTS:
                displayValue = 'Translatable#Event Based';
                break;
            case JobProperty.TRIGGER_TIME:
                displayValue = 'Translatable#Time Based';
                break;
            case JobProperty.ACTION_COUNT:
                displayValue = 'Translatable#Number of Actions';
                break;
            case JobProperty.LAST_EXEC_TIME:
                displayValue = 'Translatable#Last Run';
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
                case JobProperty.TRIGGER_EVENTS:
                    let eventExecPlans: ExecPlan[] = [];
                    let events: string[] = [];
                    if (Array.isArray(job.ExecPlans) && !!job.ExecPlans.length) {
                        eventExecPlans = job.ExecPlans;
                    } else if (Array.isArray(job.ExecPlanIDs) && !!job.ExecPlanIDs.length) {
                        eventExecPlans = await KIXObjectService.loadObjects<ExecPlan>(
                            KIXObjectType.EXEC_PLAN, job.ExecPlanIDs, undefined, true
                        ).catch(() => [] as ExecPlan[]);
                    }
                    if (eventExecPlans) {
                        eventExecPlans.forEach((ep) => {
                            if (ep.Parameters && Array.isArray(ep.Parameters.Events)) {
                                events = [...events, ...ep.Parameters.Events];
                            }
                        });
                    }
                    // translatable = false;
                    // displayValue = events.sort((a, b) => SortUtil.compareString(a, b)).join(', ');
                    displayValue = !!events.length ? 'Translatable#Yes' : 'Translatable#No';
                    break;
                case JobProperty.TRIGGER_TIME:
                    let timeExecPlans: ExecPlan[] = [];
                    const times: string[] = [];
                    if (Array.isArray(job.ExecPlans) && !!job.ExecPlans.length) {
                        timeExecPlans = job.ExecPlans;
                    } else if (Array.isArray(job.ExecPlanIDs) && !!job.ExecPlanIDs.length) {
                        timeExecPlans = await KIXObjectService.loadObjects<ExecPlan>(
                            KIXObjectType.EXEC_PLAN, job.ExecPlanIDs, undefined, true
                        ).catch(() => [] as ExecPlan[]);
                    }
                    if (timeExecPlans) {
                        timeExecPlans.forEach((ep) => {
                            if (ep.Parameters && Array.isArray(ep.Parameters.Weekdays) && ep.Parameters.Time) {
                                // FIXME: "translate" weekdays and time
                                times.push(ep.Parameters.Weekdays.join(',') + ': ' + ep.Parameters.Time);
                            }
                        });
                    }
                    // translatable = false;
                    // displayValue = times.join('; ');
                    displayValue = !!times.length ? 'Translatable#Yes' : 'Translatable#No';
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

}
