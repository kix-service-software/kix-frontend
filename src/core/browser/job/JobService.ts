/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from "../kix";
import {
    SystemAddress, KIXObjectType, TreeNode, JobProperty, SysConfigKey, SysConfigOption, SortUtil,
    DataType, KIXObjectSpecificCreateOptions, TicketProperty, ArticleProperty, Job
} from "../../model";
import { MacroAction, MacroActionType, Macro } from "../../model/kix/macro";
import { ExecPlan } from "../../model/kix/exec-plan";

export class JobService extends KIXObjectService<SystemAddress> {

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
        property: string, showInvalid?: boolean, filterIds?: Array<string | number>
    ): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];

        switch (property) {
            case JobProperty.EXEC_PLAN_EVENTS:
                const ticketEvents = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.TICKET_EVENTS], null, null, true
                ).catch((error): SysConfigOption[] => []);
                const articleEvents = await KIXObjectService.loadObjects<SysConfigOption>(
                    KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.ARTICLE_EVENTS], null, null, true
                ).catch((error): SysConfigOption[] => []);
                nodes = this.prepareEventTree(ticketEvents, articleEvents);
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

    private prepareEventTree(ticketEvents: SysConfigOption[], articleEvents: SysConfigOption[]): TreeNode[] {
        let nodes = [];
        if (ticketEvents && ticketEvents.length) {
            nodes = ticketEvents[0].Value.map((event: string) => {
                return new TreeNode(event, event);
            });
        }
        if (articleEvents && articleEvents.length) {
            nodes = [
                ...nodes,
                ...articleEvents[0].Value.map((event: string) => {
                    return new TreeNode(event, event);
                })
            ];
        }
        return SortUtil.sortObjects(nodes, 'label', DataType.STRING);
    }

    public async hasArticleEvent(events: string[]): Promise<boolean> {
        let hasArticleEvent = false;
        if (events) {
            const articleEventsConfig = await KIXObjectService.loadObjects<SysConfigOption>(
                KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.ARTICLE_EVENTS], null, null, true
            ).catch((error): SysConfigOption[] => []);

            if (articleEventsConfig && articleEventsConfig.length) {
                const articleEvents = articleEventsConfig[0].Value as string[];
                hasArticleEvent = events.some((e) => articleEvents.some((ae) => ae === e));
            }
        }
        return hasArticleEvent;
    }

    protected async preparePredefinedValues(forUpdate: boolean): Promise<Array<[string, any]>> {
        return [
            [JobProperty.TYPE, 'Ticket']
        ];
    }

    protected async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        switch (property) {
            case JobProperty.FILTER:
                if (value) {
                    const newValue = {};
                    for (const valueProperty in value) {
                        if (valueProperty) {
                            let newValutProperty = valueProperty;

                            switch (valueProperty) {
                                case TicketProperty.TYPE_ID:
                                case TicketProperty.STATE_ID:
                                case TicketProperty.PRIORITY_ID:
                                case TicketProperty.QUEUE_ID:
                                case TicketProperty.LOCK_ID:
                                case TicketProperty.ORGANISATION_ID:
                                case TicketProperty.CONTACT_ID:
                                case TicketProperty.OWNER_ID:
                                case TicketProperty.RESPONSIBLE_ID:
                                    if (!newValutProperty.match(/^Ticket::/)) {
                                        newValutProperty = 'Ticket::' + newValutProperty;
                                    }
                                    break;
                                case ArticleProperty.SENDER_TYPE_ID:
                                case ArticleProperty.CHANNEL_ID:
                                case ArticleProperty.TO:
                                case ArticleProperty.CC:
                                case ArticleProperty.FROM:
                                case ArticleProperty.SUBJECT:
                                case ArticleProperty.BODY:
                                    if (!newValutProperty.match(/^Article::/)) {
                                        newValutProperty = 'Article::' + newValutProperty;
                                    }
                                    break;
                                default:
                            }

                            newValue[newValutProperty] = value[valueProperty];
                        }
                    }
                    value = newValue;
                }
                break;
            default:

        }
        return [[property, value]];
    }

    protected async postPrepareValues(
        parameter: Array<[string, any]>, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<Array<[string, any]>> {
        const actionParameter = parameter.filter((p) => p[0].match(/^ACTION###/));
        parameter = parameter.filter(
            (p) => p[0] !== JobProperty.MACRO_ACTIONS && !p[0].match(/^ACTION###/)
        );

        const actions: Map<string, MacroAction> = new Map();
        actionParameter.forEach((p) => {
            const actionFieldInstanceId = p[0].replace(/^ACTION###(.+)###.+###.+/, '$1');
            const actionType = p[0].replace(/^ACTION###.+###(.+)###.+/, '$1');
            const valueName = p[0].replace(/^ACTION###.+###.+###(.+)/, '$1');

            let action = actions.get(actionFieldInstanceId);
            if (!action) {
                action = new MacroAction();
                action.Type = actionType;
                action.Parameters = {};
            }

            if (valueName === 'SKIP') {
                // true means "skip" (checkbox), so valid id have to mean "invalid" (= 2)
                action.ValidID = p[1] ? 2 : 1;
            } else {
                action.Parameters[valueName] = p[1];
            }
            actions.set(actionFieldInstanceId, action);
        });

        parameter.push([
            JobProperty.MACRO_ACTIONS, Array.from(actions.values())
        ]);
        return parameter;
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
