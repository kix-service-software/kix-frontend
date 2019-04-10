import { ComponentState } from "./ComponentState";
import {
    FormInputComponent, PermissionFormData, CreatePermissionDescription,
    CRUD, KIXObjectType, FormFieldOption, Permission, Role,
    KIXObjectLoadingOptions, FilterCriteria, RoleProperty, FilterDataType, FilterType, ContextType
} from "../../../../../../core/model";
import {
    IdService, LabelService, ObjectPropertyValue,
    KIXObjectService, SearchOperator, ContextService
} from "../../../../../../core/browser";
import { RolePermissionManager } from "../../../../../../core/browser/user";

class Component extends FormInputComponent<any[], ComponentState> {

    private formListenerId: string;
    private permissionFormTimeout: any;
    private rolePermissionManager: RolePermissionManager;

    public async onCreate(): Promise<void> {
        this.state = new ComponentState();
        this.formListenerId = IdService.generateDateBasedId('role-permission-input-listener-');
        await this.prepareTitles();
    }

    public onInput(input: any): void {
        super.onInput(input);
        if (input.field && input.field.options && !!input.field.options.length) {
            const propValPermissionOption: FormFieldOption = input.field.options.find(
                (o: FormFieldOption) => o.option === 'FOR_PROPERTY_VALUE_PERMISSION'
            );
            this.state.showRequired = propValPermissionOption ? propValPermissionOption.value : false;
        }

        return input;
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.rolePermissionManager = new RolePermissionManager();
        if (this.rolePermissionManager) {
            this.rolePermissionManager.init();
            this.rolePermissionManager.setIsDependentObjectPermission(this.state.showRequired);
            await this.setCurrentNode();
            this.state.rolePermissionManager = this.rolePermissionManager;
            this.state.rolePermissionManager.registerListener(this.formListenerId, () => {
                if (this.permissionFormTimeout) {
                    clearTimeout(this.permissionFormTimeout);
                }
                this.permissionFormTimeout = setTimeout(async () => {
                    const permissionDescriptions: CreatePermissionDescription[] = [];
                    if (this.state.rolePermissionManager.hasDefinedValues()) {
                        const values = this.state.rolePermissionManager.getEditableValues();
                        values.forEach((v) => {
                            const crudValue = this.getPermissionValueFromCRUD(v.value);
                            if (v.property) {
                                permissionDescriptions.push(
                                    new CreatePermissionDescription(
                                        null, null,
                                        v.value && (v.value as PermissionFormData).IsRequired ? 1 : 0,
                                        crudValue,
                                        v.value && (v.value as PermissionFormData).Comment,
                                        Number(v.property),
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
        if (this.state.rolePermissionManager) {
            this.state.rolePermissionManager.unregisterListener(this.formListenerId);
        }
    }

    public async setCurrentNode(): Promise<void> {
        const permissionDescriptions: CreatePermissionDescription[] = [];
        const context = ContextService.getInstance().getActiveContext(ContextType.MAIN);
        if (context) {
            const object = await context.getObject();
            if (object && object.ConfiguredPermissions) {
                let permissons: Permission[] = object.ConfiguredPermissions.Assigned;
                if (this.state.showRequired) {
                    permissons = object.ConfiguredPermissions.DependingObjects;
                }
                const roles = await KIXObjectService.loadObjects<Role>(KIXObjectType.ROLE, null,
                    new KIXObjectLoadingOptions(
                        null, [
                            new FilterCriteria(
                                RoleProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, 1
                            )
                        ]
                    )
                );
                permissons.filter(
                    (permission: Permission) => roles.some((r) => r.ID === permission.RoleID)
                ).forEach((permission: Permission) => {
                    this.rolePermissionManager.setValue(
                        new ObjectPropertyValue(
                            permission.RoleID.toString(), null, this.getPermissionFormData(permission),
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
                            permission.RoleID,
                            permission.ID
                        )
                    );
                });
            }
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
