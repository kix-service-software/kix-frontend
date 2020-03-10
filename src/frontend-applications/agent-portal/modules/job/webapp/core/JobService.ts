/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../../../../modules/base-components/webapp/core/KIXObjectService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { TreeNode } from "../../../base-components/webapp/core/tree";
import { JobProperty } from "../../model/JobProperty";
import { SysConfigOption } from "../../../sysconfig/model/SysConfigOption";
import { SysConfigKey } from "../../../sysconfig/model/SysConfigKey";
import { MacroActionType } from "../../model/MacroActionType";
import { Job } from "../../model/Job";
import { ExecPlan } from "../../model/ExecPlan";
import { Macro } from "../../model/Macro";

export class JobService extends KIXObjectService<Job> {

    private static INSTANCE: JobService = null;

    public static getInstance(): JobService {
        if (!JobService.INSTANCE) {
            JobService.INSTANCE = new JobService();
        }

        return JobService.INSTANCE;
    }

    public isServiceFor(kixObjectType: KIXObjectType) {
        return kixObjectType === KIXObjectType.JOB
            || kixObjectType === KIXObjectType.EXEC_PLAN
            || kixObjectType === KIXObjectType.MACRO
            || kixObjectType === KIXObjectType.MACRO_ACTION_TYPE;
    }

    public getLinkObjectName(): string {
        return 'Job';
    }

    public async getTreeNodes(
        property: string, showInvalid?: boolean, invalidClickable?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        switch (property) {
            case JobProperty.EXEC_PLAN_EVENTS:
                nodes = await super.getTicketArticleEventTree();
                break;
            case JobProperty.MACRO_ACTIONS:
                const macroActionTypes = await KIXObjectService.loadObjects<MacroActionType>(
                    KIXObjectType.MACRO_ACTION_TYPE, undefined, null, null, true
                ).catch((error): MacroActionType[] => []);
                if (macroActionTypes && !!macroActionTypes.length) {
                    nodes = macroActionTypes.map((mat) => new TreeNode(mat.Name, mat.DisplayName));
                }
                break;
            default:
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
                    KIXObjectType.EXEC_PLAN, job.ExecPlanIDs, undefined, true
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
                    KIXObjectType.MACRO, job.MacroIDs, undefined, true
                ).catch(() => [] as Macro[]);
            }
        }
        return macros;
    }
}
