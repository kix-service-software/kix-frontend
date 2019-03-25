import { ComponentState } from "./ComponentState";
import { CheckboxOption } from "./CheckboxOption";
import { KIXObjectService, AbstractMarkoComponent, LabelService } from "../../../../../../core/browser";
import { PermissionType, KIXObjectType, PermissionFormData, PermissionProperty } from "../../../../../../core/model";

class Component extends AbstractMarkoComponent {

    public state: ComponentState;

    public async onCreate(input: any): Promise<void> {
        this.state = new ComponentState();
    }

    public async onInput(input: any): Promise<void> {
        await this.setCheckboxOptions(input);
        await this.prepareTitles();
        if (input.value && typeof input.value !== 'undefined' && input.value instanceof PermissionFormData) {
            this.state.checkboxOptions.forEach((co) => {
                if (typeof input.value[co.id] === 'boolean') {
                    co.checked = input.value[co.id];
                }
            });
            (this as any).setStateDirty('checkboxOptions');
        }
    }

    public async onMount(): Promise<void> {
        //
    }

    private async setCheckboxOptions(input: any): Promise<void> {
        const permissionTypes = await KIXObjectService.loadObjects<PermissionType>(KIXObjectType.PERMISSION_TYPE);
        const staticTypes = permissionTypes.filter((pt) => pt.Name === 'Resource' || pt.Name === 'Object');
        this.state.checkboxOptions = [
            new CheckboxOption(
                PermissionProperty.IS_REQUIRED, false,
                staticTypes && !!staticTypes.length && input.propertyId && staticTypes.some(
                    (st) => st.ID.toString() === input.propertyId.toString()
                ) ? false : true
            ),
            new CheckboxOption(PermissionProperty.CREATE),
            new CheckboxOption(PermissionProperty.READ),
            new CheckboxOption(PermissionProperty.UPDATE),
            new CheckboxOption(PermissionProperty.DELETE),
            new CheckboxOption(PermissionProperty.DENY),
        ];
    }

    private async prepareTitles(): Promise<void> {
        for (const option of this.state.checkboxOptions) {
            const title = await LabelService.getInstance().getPropertyText(option.id, KIXObjectType.PERMISSION);
            this.state.titles.set(option.id, title || option.id);
        }
        (this as any).setStateDirty('titles');
    }

    public checkboxClicked(id: string): void {
        const option = this.state.checkboxOptions.find((o) => o.id === id);
        if (option) {
            option.checked = !option.checked;
        }
        const permissiondata: PermissionFormData = new PermissionFormData();
        this.state.checkboxOptions.forEach((co) => permissiondata[co.id] = co.checked);

        (this as any).emit('change', permissiondata);
    }
}

module.exports = Component;
