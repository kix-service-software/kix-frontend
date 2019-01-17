import {
    Context, ContextConfiguration, ObjectData, WidgetConfiguration,
    ContextType, KIXObjectType, ContextMode, ContextDescriptor
} from '../../model';
import { ContextSocketListener } from './ContextSocketListener';
import { IContextServiceListener } from './IContextServiceListener';
import { ContextHistoryEntry } from './ContextHistoryEntry';
import { ContextHistory } from './ContextHistory';
import { RoutingService } from '../router';
import { ContextFactory } from './ContextFactory';
import { DialogService } from '../components';

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
    private objectData: ObjectData;

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
            contextId, kixObjectType, contextMode, objectId, reset
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
                    contextId, dialogs[0].kixObjectType, dialogs[0].contextMode
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
        await ContextSocketListener.getInstance().saveWidgetConfiguration(instanceId, widgetConfiguration, contextId);
    }

    public setObjectData(objectData: ObjectData): void {
        this.objectData = objectData;
    }

    public getObjectData(): ObjectData {
        return this.objectData;
    }

}
