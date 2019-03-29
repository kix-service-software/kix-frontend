import { ComponentState } from "./ComponentState";
import { CheckboxOption } from "./CheckboxOption";
import { KIXObjectService, AbstractMarkoComponent, LabelService } from "../../../../../../core/browser";
import { PermissionType, KIXObjectType, PermissionFormData, PermissionProperty } from "../../../../../../core/model";
import { TranslationService } from "../../../../../../core/browser/i18n/TranslationService";

class Component extends AbstractMarkoComponent {

    public state: ComponentState;

    public async onCreate(input: any): Promise<void> {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.update(input);

        return input;
    }

    private async update(input): Promise<void> {
        await this.setCheckboxOptions(input);
        this.prepareTitles();
        if (input.value && typeof input.value !== 'undefined' && input.value instanceof PermissionFormData) {
            this.state.checkboxOptions.forEach((co) => {
                if (typeof input.value[co.id] === 'boolean') {
                    co.checked = input.value[co.id];
                }
            });
            this.state.comment = input.value.Comment;
            (this as any).setStateDirty('checkboxOptions');
        }
    }

    public async onMount(): Promise<void> {
        this.state.commentPlaceholder = await TranslationService.translate('Translatable#Comment');
    }

    private async setCheckboxOptions(input: any): Promise<void> {
        const options = await this.getOptions(input);
        this.state.checkboxOptions = [
            new CheckboxOption(
                PermissionProperty.IS_REQUIRED, false, options[0], options[1]
            ),
            new CheckboxOption(PermissionProperty.CREATE),
            new CheckboxOption(PermissionProperty.READ),
            new CheckboxOption(PermissionProperty.UPDATE),
            new CheckboxOption(PermissionProperty.DELETE),
            new CheckboxOption(PermissionProperty.DENY),
        ];
    }

    private async getOptions(input: any): Promise<boolean[]> {
        let showRequired: boolean = true;
        let requiredIsReadonly: boolean = true;
        let checkPermissionType: boolean = true;
        if (input.options && !!input.options.length) {
            const requiredOption = input.options.find(
                (o) => o[0] === 'showRequired'
            );
            showRequired = requiredOption ? requiredOption[1] : true;
            const permissionTypeOption = input.options.find(
                (o) => o[0] === 'checkPermissionType'
            );
            checkPermissionType = permissionTypeOption ? permissionTypeOption[1] : true;
        }
        if (checkPermissionType) {
            const permissionTypes = await KIXObjectService.loadObjects<PermissionType>(KIXObjectType.PERMISSION_TYPE);
            const staticTypes = permissionTypes.filter((pt) => pt.Name !== 'Resource' && pt.Name !== 'Object');
            if (
                staticTypes && !!staticTypes.length
                && input.propertyId && staticTypes.some(
                    (st) => st.ID.toString() === input.propertyId.toString()
                )
            ) {
                requiredIsReadonly = false;
            }
        }
        return [showRequired, requiredIsReadonly];
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
        this.emitChanges();
    }

    public commentchanged(event: any): void {
        this.state.comment = event && event.target ? event.target.value : this.state.comment;
        this.emitChanges();
    }

    private emitChanges(): void {
        const permissiondata: PermissionFormData = new PermissionFormData();
        this.state.checkboxOptions.forEach((co) => permissiondata[co.id] = co.checked);
        permissiondata.Comment = this.state.comment;

        (this as any).emit('change', permissiondata);
    }
}

module.exports = Component;
