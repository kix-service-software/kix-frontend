import { ComponentState } from './ComponentState';
import { ContextService } from '@kix/core/dist/browser';

export class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.instanceId);
    }

    public onInput(input: any): void {
        this.state.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(this.state.contextType);
        this.state.contextId = context.descriptor.contextId;
        this.state.widgetConfiguration = context ? context.getWidgetConfiguration(this.state.instanceId) : undefined;
    }

    public isExplorerMinimized(instanceId: string): boolean {
        const context = ContextService.getInstance().getActiveContext();
        return context.isExplorerExpanded(instanceId);
    }
}

module.exports = Component;
