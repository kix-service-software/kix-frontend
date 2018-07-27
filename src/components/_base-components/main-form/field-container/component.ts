import { FormField } from "@kix/core/dist/model";
import { FormInputRegistry, FormService } from "@kix/core/dist/browser";
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
        const definition = FormInputRegistry.getInstance().getFormInputComponent(field.property, this.state.objectType);
        return ComponentsService.getInstance().getComponentTemplate(definition.componentId);
    }
}

module.exports = FieldContainerComponent;
