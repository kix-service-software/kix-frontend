import { ContextService } from '@kix/core/dist/browser/context';
import { FormComponentState } from './FormComponentState';
import { FormField } from '@kix/core/dist/model';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { FormService } from '@kix/core/dist/browser/form';
import { DialogService } from '@kix/core/dist/browser/DialogService';

class FormComponent {

    private state: FormComponentState;

    public onCreate(input: any): void {
        this.state = new FormComponentState(input.formId);
    }

    public onMount(): void {
        this.state.formInstance = FormService.getInstance().getOrCreateFormInstance(this.state.formId);
    }

    private getInputComponent(field: FormField): any {
        const component = FormService.getInstance().getFormInputComponent(field.property);
        return ComponentsService.getInstance().getComponentTemplate(component);
    }

    public doCancel(): void {
        DialogService.getInstance().openMainDialog();
    }

}

module.exports = FormComponent;
