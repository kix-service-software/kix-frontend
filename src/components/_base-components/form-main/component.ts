import { ContextService } from '@kix/core/dist/browser/context';
import { FormComponentState } from './FormularComponentState';
import { FormField } from '@kix/core/dist/model';
import { ComponentsService } from '@kix/core/dist/browser/components';
import { FormService } from '@kix/core/dist/browser/form';

class FormularComponent {

    private state: FormComponentState;

    public onCreate(input: any): void {
        this.state = new FormComponentState(input.formularId);
        FormService.getInstance().setDefaultInputComponent("form-text-input");
    }

    public onMount(): void {
        const objectData = ContextService.getInstance().getObjectData();
        if (objectData && objectData.formulars) {
            this.state.form = objectData.formulars.find((f) => f.id === this.state.formId);
        }
    }

    private getInputComponent(field: FormField): any {
        const component = FormService.getInstance().getFormInputComponent(field.property);
        return ComponentsService.getInstance().getComponentTemplate(component);
    }

}

module.exports = FormularComponent;
