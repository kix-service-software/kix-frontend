import { AbstractMarkoComponent, ActionFactory, ContextService } from '../../../../../core/browser';
import { ComponentState } from './ComponentState';
import { KIXObjectType, Queue } from '../../../../../core/model';
import { QueueLabelProvider, QueueDetailsContext } from '../../../../../core/browser/ticket';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public async onMount(): Promise<void> {
        this.state.labelProvider = new QueueLabelProvider();
        const context = await ContextService.getInstance().getContext<QueueDetailsContext>(
            QueueDetailsContext.CONTEXT_ID
        );
        context.registerListener('ticket-queue-info-widget', {
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
