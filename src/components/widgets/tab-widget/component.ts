import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, ContextService } from '../../../core/browser';
import { ComponentInput } from './ComponentInput';
import { ContextType, TabWidgetSettings } from '../../../core/model';

class Component extends AbstractMarkoComponent<ComponentState> {

    private contextType: ContextType;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.state.instanceId = input.instanceId;
        this.contextType = input.contextType;
    }

    public async onMount(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext(this.contextType);
        this.state.widgetConfiguration = context
            ? context.getWidgetConfiguration(this.state.instanceId)
            : undefined;

        if (this.state.widgetConfiguration) {
            const settings: TabWidgetSettings = this.state.widgetConfiguration.settings;
            const widgets = [];
            settings.widgets.forEach((w) => {
                const config = context.getWidget(w);
                if (config) {
                    widgets.push(config);
                }
            });
            this.state.widgets = widgets;
        }
        this.state.show = true;
    }

}

module.exports = Component;
