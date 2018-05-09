import { FormField } from "@kix/core/dist/model";
import { FormService } from "@kix/core/dist/browser";
import { ComponentsService } from "@kix/core/dist/browser/components";

class FieldContainerComponent {

    private getInputComponent(field: FormField): any {
        const component = FormService.getInstance().getFormInputComponent(field.property);
        return ComponentsService.getInstance().getComponentTemplate(component);
    }

}

module.exports = FieldContainerComponent;
