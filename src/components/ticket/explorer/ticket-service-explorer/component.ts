import { TicketService } from '@kix/core/dist/browser/ticket';
import { ContextService } from '@kix/core/dist/browser/context/ContextService';
import { ObjectType, ContextFilter, TicketProperty } from '@kix/core/dist/model/';

export class ServiceExplorerComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            instanceId: null,
            widgetConfiguration: null,
            services: []
        };
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;

        this.ticketStateChanged();
    }

    private ticketStateChanged(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData && objectData.services) {
            this.state.services = objectData.services;
        } else {
            this.state.services = [];
        }
    }

    private isConfigMode(): boolean {
        return true;
    }

}

module.exports = ServiceExplorerComponent;
