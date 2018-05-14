import { ContextService } from '@kix/core/dist/browser/context';
import { FormComponentState } from './FormComponentState';
import { WidgetType, IFormEvent, UpdateFormEvent } from '@kix/core/dist/model';
import { FormService } from '@kix/core/dist/browser/form';

class FormComponent {

    private state: FormComponentState;

    public onCreate(input: any): void {
        this.state = new FormComponentState(input.formId);
    }

    public onMount(): void {
        this.state.formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
        ContextService.getInstance().getContext().setWidgetType('form-group', WidgetType.GROUP);
    }

}

module.exports = FormComponent;
