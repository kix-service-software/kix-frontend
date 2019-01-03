import { WidgetType, Context, IAction, IActionListener, KIXObject } from "../model";
import { StandardTable } from "./standard-table";

export class WidgetService {

    private static INSTANCE: WidgetService;

    private widgetActions: Map<string, [IAction[], boolean]> = new Map();
    private listeners: IActionListener[] = [];

    public static getInstance(): WidgetService {
        if (!WidgetService.INSTANCE) {
            WidgetService.INSTANCE = new WidgetService();
        }
        return WidgetService.INSTANCE;
    }

    private widgetTypes: Map<string, WidgetType> = new Map();

    public setWidgetType(instanceId: string, widgetType: WidgetType): void {
        this.widgetTypes.set(instanceId, widgetType);
    }

    public getWidgetType(instanceId: string, context?: Context<any>): WidgetType {
        let widgetType = context ? context.getContextSpecificWidgetType(instanceId) : undefined;

        if (!widgetType && this.widgetTypes.has(instanceId)) {
            widgetType = this.widgetTypes.get(instanceId);
        }

        return widgetType || WidgetType.CONTENT;
    }

    public registerActions(instanceId: string, actions: IAction[], displayText?: boolean): void {
        this.widgetActions.set(instanceId, [actions, displayText]);
        const listener = this.listeners.find((l) => l.listenerInstanceId === instanceId);
        if (listener) {
            listener.actionsChanged();
        }
    }

    public unregisterActions(instanceId: string): void {
        this.widgetActions.delete(instanceId);
        const listener = this.listeners.find((l) => l.listenerInstanceId === instanceId);
        if (listener) {
            listener.actionsChanged();
        }
    }

    public getRegisteredActions(instanceId: string): [IAction[], boolean] {
        return this.widgetActions.get(instanceId);
    }

    public registerActionListener(listener: IActionListener) {
        const existingListenerIndex = this.listeners.findIndex(
            (l) => l.listenerInstanceId === listener.listenerInstanceId
        );
        if (existingListenerIndex !== -1) {
            this.listeners.splice(existingListenerIndex, 1, listener);
        } else {
            this.listeners.push(listener);
        }
    }

    public setActionData(instanceId: string, data: KIXObject[] | StandardTable) {
        if (this.widgetActions.has(instanceId)) {
            this.widgetActions.get(instanceId)[0].forEach((a) => a.setData(data));
            const listener = this.listeners.find((l) => l.listenerInstanceId === instanceId);
            if (listener) {
                listener.actionDataChanged(data);
            }
        }
    }

    public updateActions(instanceId: string) {
        const listener = this.listeners.find((l) => l.listenerInstanceId === instanceId);
        if (listener) {
            listener.actionDataChanged();
        }
    }
}
