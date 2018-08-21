import { FormField } from "@kix/core/dist/model";
import { ComponentsService } from "@kix/core/dist/browser/components";
import { FieldContainerComponentState } from "./FieldContainerComponentState";

class FieldContainerComponent {

    private state: FieldContainerComponentState;

    public onCreate(): void {
        this.state = new FieldContainerComponentState();
    }

    public onInput(input: any): void {
        this.state.objectType = input.objectType;
        this.state.formId = input.formId;
    }

    public getInputComponent(field: FormField): any {
        const componentId = field.inputComponent ? field.inputComponent : 'form-default-input';
        return ComponentsService.getInstance().getComponentTemplate(componentId);
    }

}

module.exports = FieldContainerComponent;
