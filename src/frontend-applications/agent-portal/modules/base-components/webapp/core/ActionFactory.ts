/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from './AbstractAction';
import { IAction } from './IAction';
import { AuthenticationSocketClient } from './AuthenticationSocketClient';
import { ConfigurationType } from '../../../../model/configuration/ConfigurationType';
import { SortOrder } from '../../../../model/SortOrder';
import { SortUtil } from '../../../../model/SortUtil';
import { IdService } from '../../../../model/IdService';
import { TranslationService } from '../../../translation/webapp/core/TranslationService';
import { ActionGroup } from '../../model/ActionGroup';
import { ContextService } from './ContextService';

export class ActionFactory<T extends AbstractAction> {

    private actions: Map<string, new () => T> = new Map();
    private actionInstances: Map<string, Map<string, T>> = new Map();
    private blacklist: string[] = [];
    private widgetConfigurationActions: Map<ConfigurationType | string, string[]> = new Map();
    private widgetActions: Map<string, Array<new () => T>> = new Map();

    private static INSTANCE: ActionFactory<AbstractAction> = null;

    public static getInstance(): ActionFactory<AbstractAction> {
        if (!ActionFactory.INSTANCE) {
            ActionFactory.INSTANCE = new ActionFactory();
        }

        return ActionFactory.INSTANCE;
    }

    public registerAction(
        actionId: string, action: new () => T, configurationTypes?: Array<ConfigurationType | string>
    ): void {
        if (this.actions.has(actionId)) {
            console.warn('Duplicate action registered: ' + actionId);
        }
        this.actions.set(actionId, action);

        if (Array.isArray(configurationTypes) && configurationTypes.length) {
            configurationTypes.forEach((t) => {
                if (!this.widgetConfigurationActions.has(t)) {
                    this.widgetConfigurationActions.set(t, []);
                }

                this.widgetConfigurationActions.get(t).push(actionId);
            });
        }
    }

    public registerActionForWidget(widgetId: string, action: new () => T): void {
        if (!this.widgetActions.has(widgetId)) {
            this.widgetActions.set(widgetId, []);
        }

        this.widgetActions.get(widgetId).push(action);
    }

    public async getActionsForWidget(widgetId: string): Promise<IAction[]> {
        const actions: IAction[] = [];
        const actionConstructors = this.widgetActions.get(widgetId);
        if (actionConstructors?.length) {
            for (const ac of actionConstructors) {
                const action = await this.createActionInstance(ac);
                if (action) {
                    actions.push(action);
                }
            }
        }
        return actions;
    }

    public blacklistActions(actionsIds: string[]): void {
        actionsIds.forEach((a) => this.blacklist.push(a));
    }

    public hasAction(actionId: string): boolean {
        return this.actions.has(actionId) && !this.blacklist.some((a) => a === actionId);
    }

    public async generateActions(actionIds: string[] = [], data?: any): Promise<AbstractAction[]> {
        if (!Array.isArray(actionIds)) {
            actionIds = [];
        }

        const contextInstanceId = ContextService.getInstance().getActiveContext()?.instanceId;
        if (!this.actionInstances.has(contextInstanceId)) {
            this.actionInstances.set(contextInstanceId, new Map());
        }

        const actionMap: Map<string, IAction> = this.actionInstances.get(contextInstanceId);
        const actions = [];
        for (const actionId of actionIds) {
            if (actionMap.has(actionId)) {
                actions.push(actionMap.get(actionId));
            } else if (this.actions.has(actionId) && !this.blacklist.some((a) => a === actionId)) {
                const actionPrototype = this.actions.get(actionId);
                const action = await this.createActionInstance(actionPrototype, actionId, data);

                if (action) {
                    actions.push(action);
                }
            }
        }

        return actions;
    }

    public async createActionInstance(actionPrototype: new () => T, actionId?: string, data?: any): Promise<IAction> {
        let action: IAction = new actionPrototype();
        action.id = actionId || IdService.generateDateBasedId();

        let allowed = true;
        if (action.permissions && action.permissions.length) {
            allowed = await AuthenticationSocketClient.getInstance().checkPermissions(action.permissions);
        }

        if (allowed) {
            await action.initAction();
            await action.setData(data);
        } else {
            action = undefined;
        }

        return action;
    }

    public registerActionInstance(actionId: string, action: T, contextInstanceId: string): void {
        if (!this.actionInstances.has(contextInstanceId)) {
            this.actionInstances.set(contextInstanceId, new Map());
        }
        this.actionInstances.get(contextInstanceId).set(actionId, action);
    }

    public async getActionsForType(type: ConfigurationType | string): Promise<AbstractAction[]> {
        const actionIds = this.widgetConfigurationActions.has(type)
            ? this.widgetConfigurationActions.get(type)
            : [];
        return this.generateActions(actionIds);
    }

    public static sortList<T extends ActionGroup | IAction>(list: T[]): T[] {
        return list.sort((a, b) => {
            const aHasRank = !isNaN(Number(a.rank));
            const bHasRank = !isNaN(Number(a.rank));

            if (!aHasRank && !bHasRank) {
                return SortUtil.compareString(a.text, b.text, SortOrder.UP);
            }

            if (!aHasRank && bHasRank) {
                return -1;
            }

            if (aHasRank && !bHasRank) {
                return 1;
            }

            if (a.rank === b.rank) {
                return SortUtil.compareString(a.text, b.text, SortOrder.UP);
            } else {
                return SortUtil.compareNumber(a.rank, b.rank, SortOrder.UP, false);
            }
        });
    }

    public static async getActionList(actionList: IAction[]): Promise<Array<ActionGroup | IAction>> {
        const list: Array<ActionGroup | IAction> = [];
        const actionPromises = actionList.map((a) => a.canShow());
        const canShowResults = await Promise.all(actionPromises);
        for (const [index, canShow] of canShowResults.entries()) {
            if (!canShow) {
                continue;
            }

            const action = actionList[index];
            action['key'] = IdService.generateDateBasedId();
            if (action.groupText) {
                const group = list.find((c) => c.text === action.groupText);
                if (group instanceof ActionGroup) {
                    group.actions.push(action);
                    if (!group.icon) {
                        group.icon = action.groupIcon;
                    }
                } else {
                    list.push(new ActionGroup(
                        [action], action.groupRank, action.groupText, action.groupIcon
                    ));
                }
            } else {
                list.push(action);
            }
        }

        const actionsToShow = ActionFactory.sortList(list);
        for (const c of actionsToShow.filter((a) => a instanceof ActionGroup)) {
            c.text = await TranslationService.translate(c.text);
            c.actions = ActionFactory.sortList(c.actions);
        };

        return actionsToShow;
    }

}
