import { ComponentState } from './ComponentState';
import { ConfiguredWidget, WidgetSize } from '../../../core/model';
import { KIXModulesService } from '../../../core/browser/modules';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentState): void {
        this.state.widgets = input.widgets;
    }

    public getTemplate(widget: ConfiguredWidget): any {
        return KIXModulesService.getComponentTemplate(widget.configuration.widgetId);
    }

    public isLarge(widget: ConfiguredWidget): boolean {
        return widget.configuration.size === WidgetSize.LARGE;
    }

}

module.exports = Component;
