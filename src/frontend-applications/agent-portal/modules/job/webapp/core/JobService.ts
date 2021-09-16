/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { TreeNode } from '../../../base-components/webapp/core/tree';
import { JobProperty } from '../../model/JobProperty';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { MacroActionType } from '../../model/MacroActionType';
import { Job } from '../../model/Job';
import { ExecPlan } from '../../model/ExecPlan';
import { Macro } from '../../model/Macro';
import { JobType } from '../../model/JobType';
import { KIXObjectSpecificLoadingOptions } from '../../../../model/KIXObjectSpecificLoadingOptions';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { JobRun } from '../../model/JobRun';
import { JobTypes } from '../../model/JobTypes';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { LabelService } from '../../../base-components/webapp/core/LabelService';

export class JobService extends KIXObjectService<Job> {

    private static INSTANCE: JobService = null;
    private typeMapping: any = {};

    public static getInstance(): JobService {
        if (!JobService.INSTANCE) {
            JobService.INSTANCE = new JobService();
        }

        return JobService.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.JOB);
        this.objectConstructors.set(KIXObjectType.JOB, [Job]);
        this.objectConstructors.set(KIXObjectType.JOB_TYPE, [JobType]);
        this.objectConstructors.set(KIXObjectType.JOB_RUN, [JobRun]);
        this.objectConstructors.set(KIXObjectType.EXEC_PLAN, [ExecPlan]);
        this.objectConstructors.set(KIXObjectType.MACRO, [Macro]);
        this.objectConstructors.set(KIXObjectType.MACRO_ACTION_TYPE, [MacroActionType]);
    }

    public addTypeMapping(jobType: JobTypes | string, kixObjectType: KIXObjectType | string): void {
        if (!this.typeMapping) {
            this.typeMapping = {};
        }
        this.typeMapping[jobType] = kixObjectType;
    }

    public getObjectTypeForJobType(jobType: JobTypes | string): KIXObjectType {
        return this.typeMapping[jobType] || KIXObjectType.TICKET;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.JOB
            || kixObjectType === KIXObjectType.JOB_TYPE
            || kixObjectType === KIXObjectType.JOB_RUN
            || kixObjectType === KIXObjectType.EXEC_PLAN
            || kixObjectType === KIXObjectType.MACRO
            || kixObjectType === KIXObjectType.MACRO_ACTION_TYPE;
    }

    public getLinkObjectName(): string {
        return 'Job';
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean,
        filterIds?: Array<string | number>, loadingOptions?: KIXObjectLoadingOptions,
        objectLoadingOptions?: KIXObjectSpecificLoadingOptions
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        switch (property) {
            case JobProperty.TYPE:
                const jobTypes = await KIXObjectService.loadObjects<JobType>(
                    KIXObjectType.JOB_TYPE, undefined, null, objectLoadingOptions, true
                ).catch((error): JobType[] => []);
                if (jobTypes && !!jobTypes.length) {
                    nodes = jobTypes.map((mat) => new TreeNode(mat.Name, mat.DisplayName));
                }
                break;
            case JobProperty.EXEC_PLAN_EVENTS:
                nodes = await super.getTicketArticleEventTree();
                break;
            case JobProperty.MACRO_ACTIONS:
                const macroActionTypes = await KIXObjectService.loadObjects<MacroActionType>(
                    KIXObjectType.MACRO_ACTION_TYPE, undefined, null, objectLoadingOptions, true
                ).catch((error): MacroActionType[] => []);
                if (macroActionTypes && !!macroActionTypes.length) {
                    nodes = macroActionTypes.map((mat) => new TreeNode(mat.Name, mat.DisplayName));
                }
                break;
            default:
        }

        return nodes;
    }

    public async prepareObjectTree(
        objects: JobType[], showInvalid?: boolean,
        invalidClickable?: boolean, filterIds?: Array<string | number>,
        translatable?: boolean
    ): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [];
        if (objects && objects.length) {
            if (objects[0].KIXObjectType === KIXObjectType.JOB_TYPE) {
                for (const o of objects) {
                    const displayValue = translatable
                        ? await TranslationService.translate(o.DisplayName)
                        : o.DisplayName;
                    const icon = LabelService.getInstance().getObjectIcon(o);
                    nodes.push(new TreeNode(o.Name, displayValue, icon));
                }
            }
        }
        return nodes;
    }

    public async hasArticleEvent(events: string[]): Promise<boolean> {
        let hasArticleEvent = false;
        if (events) {
            const articleEventsConfig = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.ARTICLE_EVENTS], null, null, true
            ).catch((error): SysConfigOption[] => []);

            if (articleEventsConfig && articleEventsConfig.length) {
                const articleEvents = articleEventsConfig[0].Value as string[];
                hasArticleEvent = events.some(
                    (e) => articleEvents.some((ae) => ae === e) || e === 'ArticleDynamicFieldUpdate'
                );
            }
        }
        return hasArticleEvent;
    }

    public static async getExecPlansOfJob(job: Job): Promise<ExecPlan[]> {
        let execPlans: ExecPlan[] = [];
        if (job) {
            if (Array.isArray(job.ExecPlans) && !!job.ExecPlans.length) {
                execPlans = job.ExecPlans;
            } else if (Array.isArray(job.ExecPlanIDs) && !!job.ExecPlanIDs.length) {
                execPlans = await KIXObjectService.loadObjects<ExecPlan>(
                    KIXObjectType.EXEC_PLAN, job.ExecPlanIDs, undefined, null, true
                ).catch(() => [] as ExecPlan[]);
            }
        }
        return execPlans;
    }

    public static async getMacrosOfJob(job: Job): Promise<Macro[]> {
        let macros: Macro[] = [];
        if (job) {
            if (Array.isArray(job.Macros) && !!job.Macros.length) {
                macros = job.Macros;
            } else if (Array.isArray(job.MacroIDs) && !!job.MacroIDs.length) {
                macros = await KIXObjectService.loadObjects<Macro>(
                    KIXObjectType.MACRO, job.MacroIDs, undefined, null, true
                ).catch(() => [] as Macro[]);
            }
        }
        return macros;
    }
}
