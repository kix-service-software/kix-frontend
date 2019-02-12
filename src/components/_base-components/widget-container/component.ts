import { ComponentState } from './ComponentState';
import { ConfiguredWidget, WidgetSize } from '../../../core/model';
import { ComponentsService } from '../../../core/browser/components';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentState): void {
        this.state.widgets = input.widgets;
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return ComponentsService.getInstance().getComponentTemplate(widget.configuration.widgetId);
    }

    public isLarge(widget: ConfiguredWidget): boolean {
        return widget.configuration.size === WidgetSize.LARGE;
    }

}

module.exports = Component;
