import { ContextService } from '@kix/core/dist/browser/context';
import { FormComponentState } from './FormularComponentState';
import { FormField } from '@kix/core/dist/model';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { FormService } from '@kix/core/dist/browser/form';
import { DialogService } from '@kix/core/dist/browser/DialogService';

class FormularComponent {

    private state: FormComponentState;

    public onCreate(input: any): void {
        this.state = new FormComponentState(input.formId);
        FormService.getInstance().setDefaultInputComponent("form-text-input");
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData && objectData.forms) {
            this.state.form = objectData.forms.find((f) => f.id === this.state.formId);
        }
    }

    private getInputComponent(field: FormField): any {
        const component = FormService.getInstance().getFormInputComponent(field.property);
        return ComponentsService.getInstance().getComponentTemplate(component);
    }

    private getFieldHint(field: FormField): string {
        const hint = FormService.getInstance().getFormFieldHint(field);
        return hint ? hint : field.property;
    }

    public doCancel(): void {
        DialogService.getInstance().toggleMainDialog();
    }

}

module.exports = FormularComponent;
