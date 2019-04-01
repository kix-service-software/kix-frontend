import { ComponentState } from "./ComponentState";
import {
    FormInputComponent, PermissionFormData, CreatePermissionDescription, CRUD, KIXObjectType, Permission
} from "../../../../../../core/model";
import { IdService, LabelService, ObjectPropertyValue, IDynamicFormManager } from "../../../../../../core/browser";
import { PermissionManager } from "../../../../../../core/browser/user";

class Component extends FormInputComponent<any[], ComponentState> {

    private formListenerId: string;
    private permissionFormTimeout: any;

    public async onCreate(): Promise<void> {
        this.state = new ComponentState();
        this.formListenerId = IdService.generateDateBasedId('permission-form-listener-');
        await this.prepareTitles();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const permissionManager = new PermissionManager();
        if (permissionManager) {
            permissionManager.init();
            await this.setCurrentNode(permissionManager);
            this.state.permissionManager = permissionManager;
            this.state.permissionManager.registerListener(this.formListenerId, () => {
                if (this.permissionFormTimeout) {
                    clearTimeout(this.permissionFormTimeout);
                }
                this.permissionFormTimeout = setTimeout(async () => {
                    const permissionDescriptions: CreatePermissionDescription[] = [];
                    if (this.state.permissionManager.hasDefinedValues()) {
                        const values = this.state.permissionManager.getEditableValues();
                        values.forEach((v) => {
                            const crudValue = this.getPermissionValueFromCRUD(v.value);
                            if (v.property && v.operator) {
                                permissionDescriptions.push(
                                    new CreatePermissionDescription(
                                        Number(v.property),
                                        v.operator,
                                        v.value && (v.value as PermissionFormData).IsRequired ? 1 : 0,
                                        crudValue,
                                        v.value && (v.value as PermissionFormData).Comment,
                                        null,
                                        typeof v.id !== 'undefined' && v.id !== null ? Number(v.id) : null
                                    )
                                );
                            }
                        });
                    }
                    super.provideValue(permissionDescriptions);
                }, 200);
            });
        }
    }

    public async onDestroy(): Promise<void> {
        if (this.state.permissionManager) {
            this.state.permissionManager.unregisterListener(this.formListenerId);
        }
    }

    public async setCurrentNode(permissionManager: IDynamicFormManager): Promise<void> {
        const permissionDescriptions: CreatePermissionDescription[] = [];
        if (this.state.defaultValue && this.state.defaultValue.value && Array.isArray(this.state.defaultValue.value)) {
            this.state.defaultValue.value.forEach((permission: Permission) => {
                permissionManager.setValue(
                    new ObjectPropertyValue(
                        permission.TypeID.toString(), permission.Target, this.getPermissionFormData(permission),
                        null, null, null, permission.ID.toString()
                    )
                );
                permissionDescriptions.push(
                    new CreatePermissionDescription(
                        permission.TypeID,
                        permission.Target,
                        permission.IsRequired,
                        permission.Value,
                        permission.Comment,
                        null,
                        permission.ID
                    )
                );
            });
        }
        super.provideValue(permissionDescriptions);
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

    private getPermissionFormData(permission: Permission): PermissionFormData {
        const permissionFormData = new PermissionFormData();
        permissionFormData.IsRequired = permission.IsRequired === 1;
        permissionFormData.Comment = permission.Comment;
        if (permission.Value) {
            permissionFormData.CREATE = !!(permission.Value & CRUD.CREATE);
            permissionFormData.READ = !!(permission.Value & CRUD.READ);
            permissionFormData.UPDATE = !!(permission.Value & CRUD.UPDATE);
            permissionFormData.DELETE = !!(permission.Value & CRUD.DELETE);
            permissionFormData.DENY = !!(permission.Value & CRUD.DENY);
        }
        return permissionFormData;
    }
}

module.exports = Component;
