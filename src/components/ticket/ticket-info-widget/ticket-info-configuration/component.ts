import { ContextService } from '@kix/core/dist/browser/context/ContextService';

export class TicketInfoConfigurationComponent {

    private state: any;

    public onCreate(input: any): void {
        this.state = {
            instanceId: null,
            configuration: null
        };
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
    }

    public onMount(): void {
        const context = ContextService.getInstance().getContext();
        this.state.configuration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

}

module.exports = TicketInfoConfigurationComponent;
