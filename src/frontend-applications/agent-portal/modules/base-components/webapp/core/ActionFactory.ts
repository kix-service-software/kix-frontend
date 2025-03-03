/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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


export class ActionFactory<T extends AbstractAction> {

    private actions: Map<string, new () => T> = new Map();
    private actionInstances: Map<string, T> = new Map();
    private blacklist: string[] = [];
    private widgetActions: Map<ConfigurationType | string, string[]> = new Map();

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
                if (!this.widgetActions.has(t)) {
                    this.widgetActions.set(t, []);
                }

                this.widgetActions.get(t).push(actionId);
            });
        }
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

        const actions = [];
        for (const actionId of actionIds) {
            if (this.actionInstances.has(actionId)) {
                actions.push(this.actionInstances.get(actionId));
            } else if (this.actions.has(actionId) && !this.blacklist.some((a) => a === actionId)) {
                const actionPrototype = this.actions.get(actionId);
                let action: IAction = new actionPrototype();
                action.id = actionId;

                let allowed = true;
                if (action.permissions && action.permissions.length) {
                    allowed = await AuthenticationSocketClient.getInstance().checkPermissions(action.permissions);
                }

                if (allowed) {
                    await action.initAction();
                    await action.setData(data);
                    actions.push(action);
                } else {
                    action = undefined;
                }

            }
        }

        return actions;
    }

    public registerActionInstance(actionId: string, action: T): void {
        this.actionInstances.set(actionId, action);
    }

    public async getActionsForType(type: ConfigurationType | string): Promise<AbstractAction[]> {
        const actionIds = this.widgetActions.has(type)
            ? this.widgetActions.get(type)
            : [];
        return this.generateActions(actionIds);
    }

    public static sortList<T extends ActionGroup | IAction>(list: T[]): T[] {
        return list.sort((a, b) => {
            // objects wihout rank belong to the end and are not sorted by text
            // check b first to keep given order e.g. if a also has no rank
            if (typeof b.rank === 'undefined' || b.rank === null) {
                return 0;
            }
            if (typeof a.rank === 'undefined' || a.rank === null) {
                return 1;
            }

            // sort by given rank or text if equal
            if (a.rank !== b.rank) {
                return SortUtil.compareNumber(
                    a.rank, b.rank, SortOrder.UP, false
                );
            } else {
                return SortUtil.compareString(a.text, b.text, SortOrder.UP);
            }
        });
    }

    public static async getActionList(actionList: IAction[]): Promise<Array<ActionGroup | IAction>> {
        const list: Array<ActionGroup | IAction> = [];
        const actionPromises = [];
        actionList.forEach((a) => actionPromises.push(a.canShow()));
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
