/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Table } from './table';
import { IAction } from './IAction';
import { IActionListener } from './IActionListener';
import { WidgetType } from '../../../../model/configuration/WidgetType';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { Context } from '../../../../model/Context';
import { EventService } from './EventService';
import { TabContainerEvent } from './TabContainerEvent';
import { TabContainerEventData } from './TabContainerEventData';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { ConfiguredWidget } from '../../../../model/configuration/ConfiguredWidget';
import { IConfiguration } from '../../../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../../../model/configuration/WidgetConfiguration';

export class WidgetService {

    private static INSTANCE: WidgetService;

    private widgetActions: Map<string, [IAction[], boolean]> = new Map();
    private widgetClasses: Map<string, string[]> = new Map();
    private widgetTitle: Map<string, string> = new Map();
    private actionListenerListeners: IActionListener[] = [];

    public static getInstance(): WidgetService {
        if (!WidgetService.INSTANCE) {
            WidgetService.INSTANCE = new WidgetService();
        }
        return WidgetService.INSTANCE;
    }

    private widgetTypes: Map<string, WidgetType> = new Map();

    public setWidgetTitle(instanceId: string, title: string, icon?: ObjectIcon | string): void {
        this.widgetTitle.set(instanceId, title);
        EventService.getInstance().publish(
            TabContainerEvent.CHANGE_TITLE, new TabContainerEventData(instanceId, title, icon)
        );
    }

    public getWidgetTitle(instanceId: string): string {
        return this.widgetTitle.get(instanceId);
    }

    public setWidgetType(instanceId: string, widgetType: WidgetType): void {
        this.widgetTypes.set(instanceId, widgetType);
    }

    public getWidgetClasses(instanceId: string): string[] {
        if (this.widgetClasses.has(instanceId)) {
            return this.widgetClasses.get(instanceId);
        }
        return [];
    }

    public setWidgetClasses(instanceId: string, classes: string[]): void {
        this.widgetClasses.set(instanceId, classes);
    }

    public getWidgetType(instanceId: string, context?: Context): WidgetType {
        let widgetType = context ? context.getContextSpecificWidgetType(instanceId) : undefined;

        if (!widgetType && this.widgetTypes.has(instanceId)) {
            widgetType = this.widgetTypes.get(instanceId);
        }

        return widgetType || WidgetType.CONTENT;
    }

    public registerActions(instanceId: string, actions: IAction[], displayText?: boolean): void {
        this.widgetActions.set(instanceId, [actions, displayText]);
        const listener = this.actionListenerListeners.find((l) => l.listenerInstanceId === instanceId);
        if (listener) {
            listener.actionsChanged();
        }
    }

    public unregisterActions(instanceId: string): void {
        this.widgetActions.delete(instanceId);
        const listener = this.actionListenerListeners.find((l) => l.listenerInstanceId === instanceId);
        if (listener) {
            listener.actionsChanged();
        }
    }

    public getRegisteredActions(instanceId: string): [IAction[], boolean] {
        return this.widgetActions.get(instanceId);
    }

    public registerActionListener(listener: IActionListener) {
        const existingListenerIndex = this.actionListenerListeners.findIndex(
            (l) => l.listenerInstanceId === listener.listenerInstanceId
        );
        if (existingListenerIndex !== -1) {
            this.actionListenerListeners.splice(existingListenerIndex, 1, listener);
        } else {
            this.actionListenerListeners.push(listener);
        }
    }

    public setActionData(instanceId: string, data: KIXObject[] | Table) {
        if (this.widgetActions.has(instanceId)) {
            this.widgetActions.get(instanceId)[0].forEach((a) => a.setData(data));
            const listener = this.actionListenerListeners.find((l) => l.listenerInstanceId === instanceId);
            if (listener) {
                listener.actionDataChanged(data);
            }
        }
    }

    public updateActions(instanceId: string) {
        const listener = this.actionListenerListeners.find((l) => l.listenerInstanceId === instanceId);
        if (listener) {
            listener.actionDataChanged();
        }
    }
}
