import { ComponentState } from './ComponentState';
import { ContextService } from '../../../core/browser';

export class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        this.state.instanceId = input.instanceId;
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
        this.state.helpText = this.state.widgetConfiguration.settings.helpText;
    }

}

module.exports = Component;
