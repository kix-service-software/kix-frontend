import {
    Context, ContextConfiguration, WidgetConfiguration,
    ContextType, KIXObjectType, ContextMode, ContextDescriptor, ObjectUpdatedEventData
} from '../../model';
import { ContextSocketClient } from './ContextSocketClient';
import { IContextServiceListener } from './IContextServiceListener';
import { ContextHistoryEntry } from './ContextHistoryEntry';
import { ContextHistory } from './ContextHistory';
import { RoutingService } from '../router';
import { ContextFactory } from './ContextFactory';
import { DialogService } from '../components/dialog/DialogService';
import { BrowserUtil } from '../BrowserUtil';

export class ContextService {

    private static INSTANCE: ContextService = null;

    public static getInstance<CC extends ContextConfiguration, T extends Context<CC>>(): ContextService {
        if (!ContextService.INSTANCE) {
            ContextService.INSTANCE = new ContextService();
        }

        return ContextService.INSTANCE;
    }

    private serviceListener: IContextServiceListener[] = [];
    private activeMainContext: Context;
    private activeDialogContext: Context;
    private activeContextType: ContextType = ContextType.MAIN;

    public registerListener(listener: IContextServiceListener): void {
        this.serviceListener.push(listener);
    }

    public registerContext(contextDescriptor: ContextDescriptor): void {
        ContextFactory.getInstance().registerContext(contextDescriptor);
    }

    public async setContext(
        contextId: string, kixObjectType: KIXObjectType, contextMode: ContextMode,
        objectId?: string | number, reset?: boolean, history: boolean = false
    ): Promise<void> {
        const context = await ContextFactory.getInstance().getContext(
            contextId, kixObjectType, contextMode, objectId, (!history && reset)
        );

        if (context && context.getDescriptor().contextType === ContextType.MAIN) {
            if (context.getDescriptor().contextMode === ContextMode.DETAILS) {
                await context.setObjectId(objectId);
            }
            if (!history) {
                context.reset();
            }
            DialogService.getInstance().closeMainDialog();
            await ContextHistory.getInstance().addHistoryEntry(this.activeMainContext);
            this.activeMainContext = context;
            RoutingService.getInstance().routeTo(
                'base-router', context.getDescriptor().componentId, { objectId: context.getObjectId(), history }
            );
        }

        this.serviceListener.forEach(
            (sl) => sl.contextChanged(
                context.getDescriptor().contextId, context, context.getDescriptor().contextType, history
            )
        );
    }

    public async setDialogContext(
        contextId: string, kixObjectType: KIXObjectType, contextMode: ContextMode,
        objectId?: string | number, reset?: boolean, title?: string, singleTab?: boolean
    ): Promise<void> {
        let context: Context;
        if (kixObjectType) {
            context = await ContextFactory.getInstance().getContext(
                contextId, kixObjectType, contextMode, objectId, reset
            );
        } else {
            const dialogs = DialogService.getInstance().getRegisteredDialogs(contextMode);
            if (dialogs && dialogs.length) {
                context = await ContextFactory.getInstance().getContext(
                    contextId, dialogs[0].kixObjectType, dialogs[0].contextMode, null, reset
                );
            }
        }

        if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
            this.activeDialogContext = context;
            this.activeContextType = ContextType.DIALOG;

            DialogService.getInstance().openMainDialog(
                context.getDescriptor().contextMode, context.getDescriptor().componentId,
                kixObjectType, title, null, singleTab
            );

            this.serviceListener.forEach(
                (sl) => sl.contextChanged(
                    context.getDescriptor().contextId, context, context.getDescriptor().contextType, false
                )
            );
        }
    }

    public closeDialogContext(): void {
        this.activeContextType = ContextType.MAIN;
    }

    public getActiveContext(contextType?: ContextType): Context {
        const type = contextType ? contextType : this.activeContextType;
        return type === ContextType.MAIN ? this.activeMainContext : this.activeDialogContext;
    }

    public async getContext<T extends Context = Context>(contextId: string, objectId?: string | number): Promise<T> {
        return (await ContextFactory.getInstance().getContext(contextId, null, null, objectId) as T);
    }

    public async getContextByTypeAndMode<T extends Context = Context>(
        objectType: KIXObjectType, contextMode: ContextMode = ContextMode.DETAILS
    ): Promise<T> {
        return (await ContextFactory.getInstance().getContext(null, objectType, contextMode) as T);
    }

    public getHistory(limit: number = 10): ContextHistoryEntry[] {
        return ContextHistory.getInstance().getHistory(limit, this.activeMainContext)
            .filter(
                (he) => he.contextId !== this.activeMainContext.getDescriptor().contextId
                    || he.objectId !== this.activeMainContext.getObjectId()
            )
            .sort((a, b) => b.lastVisitDate - a.lastVisitDate)
            .slice(0, limit);
    }

    public async saveWidgetConfiguration<T = any>(
        instanceId: string, widgetConfiguration: WidgetConfiguration<T>,
        contextId: string = this.activeMainContext.getDescriptor().contextId
    ): Promise<void> {
        await ContextSocketClient.getInstance().saveWidgetConfiguration(instanceId, widgetConfiguration, contextId);
    }

    public async handleUpdateNotifications(events: ObjectUpdatedEventData[]): Promise<void> {
        if (this.activeContextType === ContextType.MAIN) {
            if (this.activeMainContext.getDescriptor().contextMode === ContextMode.DETAILS) {
                const showRefreshNotification = events.some((e) => {
                    const objectType = this.getObjectType(e.Namespace);
                    const isObjectType = objectType === this.activeMainContext.getDescriptor().kixObjectTypes[0];
                    const eventObjectId = e.ObjectID.split('::');
                    const isObject = eventObjectId[0] === this.activeMainContext.getObjectId().toString();
                    return isObjectType && isObject;
                });

                if (showRefreshNotification) {
                    BrowserUtil.openAppRefreshOverlay();
                }
            }
        }
    }

    private getObjectType(namespace: string): string {
        const objects = namespace.split('.');
        if (objects.length > 1) {
            if (objects[0] === 'FAQ') {
                return KIXObjectType.FAQ_ARTICLE;
            } else if (objects[0] === 'CMDB') {
                return objects[1];
            }
        }
        return objects[0];
    }

}
