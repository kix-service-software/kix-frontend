import {
    AbstractMarkoComponent, ContextService, ActionFactory, WidgetService, TableEvent
} from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { QueueDetailsContext } from '../../../../../core/browser/ticket';
import { KIXObjectType, Queue } from '../../../../../core/model';
import { IEventSubscriber, EventService } from '../../../../../core/browser/event';

class Component extends AbstractMarkoComponent<ComponentState> {

    public tableSubscriber: IEventSubscriber;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        const context = await ContextService.getInstance().getContext<QueueDetailsContext>(
            QueueDetailsContext.CONTEXT_ID
        );
        context.registerListener('queue-signature-widget', {
            sidebarToggled: () => { return; },
            explorerBarToggled: () => { return; },
            objectListChanged: () => { return; },
            filteredObjectListChanged: () => { return; },
            scrollInformationChanged: () => { return; },
            objectChanged: async (queueId: string, queue: Queue, type: KIXObjectType) => {
                if (type === KIXObjectType.QUEUE) {
                    this.initWidget(queue);
                }
            }
        });
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        this.initWidget(await context.getObject<Queue>());
    }

    public onDestroy(): void {
        WidgetService.getInstance().unregisterActions(this.state.instanceId);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_READY, this.tableSubscriber);
        EventService.getInstance().unsubscribe(TableEvent.TABLE_INITIALIZED, this.tableSubscriber);
    }

    private async initWidget(queue: Queue): Promise<void> {
        this.state.queue = queue;
        this.setActions();
    }

    private async setActions(): Promise<void> {
        if (this.state.widgetConfiguration && this.state.queue) {
            this.state.actions = await ActionFactory.getInstance().generateActions(
                this.state.widgetConfiguration.actions, [this.state.queue]
            );
        }
    }
}

module.exports = Component;
