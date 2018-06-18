import { WidgetType, FormContext } from '@kix/core/dist/model';
import { FormService } from '@kix/core/dist/browser/form';
import { WidgetService } from '@kix/core/dist/browser';
import { ComponentState } from './ComponentState';

class Component {

    private state: ComponentState;

    public onCreate(input: any): void {
        this.state = new ComponentState(input.formId);
    }

    public onMount(): void {
        WidgetService.getInstance().setWidgetType('form-group', WidgetType.GROUP);
    }

}

module.exports = Component;
