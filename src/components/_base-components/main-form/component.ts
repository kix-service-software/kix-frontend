import { FormComponentState } from './FormComponentState';
import { WidgetType, FormContext } from '@kix/core/dist/model';
import { FormService } from '@kix/core/dist/browser/form';
import { WidgetService } from '@kix/core/dist/browser';

class FormComponent {

    private state: FormComponentState;

    public onCreate(input: any): void {
        this.state = new FormComponentState(input.formId);
    }

    public onMount(): void {
        this.state.formInstance = FormService.getInstance().getFormInstance(this.state.formId);
        this.state.objectType = this.state.formInstance.getObjectType();
        this.state.isSearchContext = this.state.formInstance.formContext === FormContext.SEARCH;
        WidgetService.getInstance().setWidgetType('form-group', WidgetType.GROUP);
    }

}

module.exports = FormComponent;
