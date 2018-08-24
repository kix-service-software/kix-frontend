import { FormField } from "@kix/core/dist/model";
import { ComponentsService } from "@kix/core/dist/browser/components";
import { ComponentState } from "./ComponentState";

class FieldContainerComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.objectType = input.objectType;
        this.state.formId = input.formId;
        this.state.level = typeof input.level !== 'undefined' ? input.level : 0;
        if (this.state.level > 14) {
            this.state.level = 14;
        }
    }

    public getInputComponent(field: FormField): any {
        const componentId = field.inputComponent ? field.inputComponent : 'form-default-input';
        return ComponentsService.getInstance().getComponentTemplate(componentId);
    }

    public minimize(): void {
        this.state.minimized = !this.state.minimized;
    }

    public hasChildren(field: FormField): boolean {
        return field.children && field.children.length > 0;
    }

    public getPaddingLeft(): string {
        return (this.state.level * 2) + "rem";
    }

    public getPaddingRight(field: FormField): string {
        return this.hasChildren(field) ? "0" : "1.75rem";
    }
}

module.exports = FieldContainerComponent;
