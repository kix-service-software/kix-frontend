import { ComponentState } from "./ComponentState";
import {
    FormInputComponent, PermissionFormData, CreatePermissionDescription, CRUD, KIXObjectType, FormFieldOption
} from "../../../../../../core/model";
import { IdService, LabelService, IDynamicFormManager } from "../../../../../../core/browser";
import { RolePermissionManager } from "../../../../../../core/browser/user";

class Component extends FormInputComponent<any[], ComponentState> {

    private formListenerId: string;
    private permissionFormTimeout: any;

    public async onCreate(): Promise<void> {
        this.state = new ComponentState();
        this.formListenerId = IdService.generateDateBasedId('role-permission-input-listener-');
        await this.prepareTitles();
    }

    public onInput(input: any): void {
        super.onInput(input);
        if (input.field && input.field.options && !!input.field.options.length) {
            const requiredOption: FormFieldOption = input.field.options.find(
                (o: FormFieldOption) => o.option === 'REQUIRED'
            );
            this.state.showRequired = requiredOption ? requiredOption.value : false;
        }

        return input;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const rolePermissionManager = new RolePermissionManager();
        if (rolePermissionManager) {
            rolePermissionManager.init();
            await this.setCurrentNode(rolePermissionManager);
            this.state.rolePermissionManager = rolePermissionManager;
            this.state.rolePermissionManager.registerListener(this.formListenerId, () => {
                if (this.permissionFormTimeout) {
                    clearTimeout(this.permissionFormTimeout);
                }
                this.permissionFormTimeout = setTimeout(async () => {
                    if (this.state.rolePermissionManager.hasDefinedValues()) {
                        const values = this.state.rolePermissionManager.getEditableValues();
                        const permissionDescriptions: CreatePermissionDescription[] = [];
                        values.forEach((v) => {
                            const crudValue = this.getPermissionValueFromCRUD(v.value);
                            if (v.property) {
                                permissionDescriptions.push(
                                    new CreatePermissionDescription(
                                        null, null,
                                        v.value && (v.value as PermissionFormData).IsRequired ? 1 : 0,
                                        crudValue,
                                        v.value && (v.value as PermissionFormData).comment,
                                        Number(v.property)
                                    )
                                );
                            }
                        });
                        super.provideValue(permissionDescriptions);
                    }
                }, 200);
            });
        }
    }

    public async onDestroy(): Promise<void> {
        if (this.state.rolePermissionManager) {
            this.state.rolePermissionManager.unregisterListener(this.formListenerId);
        }
    }

    public async setCurrentNode(permissionManager: IDynamicFormManager): Promise<void> {
        if (this.state.defaultValue && this.state.defaultValue.value && Array.isArray(this.state.defaultValue.value)) {
            //
        }
        // super.provideValue(null);
    }

    private async prepareTitles(): Promise<void> {
        this.state.createTitle = await LabelService.getInstance().getPropertyText(
            this.state.createTitle, KIXObjectType.PERMISSION
        );
        this.state.readTitle = await LabelService.getInstance().getPropertyText(
            this.state.readTitle, KIXObjectType.PERMISSION
        );
        this.state.updateTitle = await LabelService.getInstance().getPropertyText(
            this.state.updateTitle, KIXObjectType.PERMISSION
        );
        this.state.deleteTitle = await LabelService.getInstance().getPropertyText(
            this.state.deleteTitle, KIXObjectType.PERMISSION
        );
        this.state.denyTitle = await LabelService.getInstance().getPropertyText(
            this.state.denyTitle, KIXObjectType.PERMISSION
        );
        this.state.requiredTitle = await LabelService.getInstance().getPropertyText(
            this.state.requiredTitle, KIXObjectType.PERMISSION
        );
    }

    private getPermissionValueFromCRUD(permissionData: PermissionFormData): number {
        const value: number = permissionData ? (permissionData.CREATE ? CRUD.CREATE : 0)
            + (permissionData.READ ? CRUD.READ : 0)
            + (permissionData.UPDATE ? CRUD.UPDATE : 0)
            + (permissionData.DELETE ? CRUD.DELETE : 0)
            + (permissionData.DENY ? CRUD.DENY : 0) : 0;
        return value;
    }
}

module.exports = Component;
