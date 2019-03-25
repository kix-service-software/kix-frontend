import { ComponentState } from "./ComponentState";
import {
    FormInputComponent, PermissionFormData, CreatePermissionDescription, CRUD, KIXObjectType
} from "../../../../../../core/model";
import { IdService, LabelService } from "../../../../../../core/browser";

class Component extends FormInputComponent<any[], ComponentState> {

    private formListenerId: string;
    private permissionFormTimeout: any;

    public async onCreate(): Promise<void> {
        this.state = new ComponentState();
        this.formListenerId = IdService.generateDateBasedId('permission-form-listener-');
        await this.prepareTitles();
    }

    public async onInput(input: any): Promise<void> {
        await super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        if (this.state.permissionManager) {
            this.state.permissionManager.init();
            this.state.permissionManager.registerListener(this.formListenerId, () => {
                if (this.permissionFormTimeout) {
                    clearTimeout(this.permissionFormTimeout);
                }
                this.permissionFormTimeout = setTimeout(async () => {
                    if (this.state.permissionManager.hasDefinedValues()) {
                        const values = this.state.permissionManager.getEditableValues();
                        const permissionDescriptions: CreatePermissionDescription[] = [];
                        values.forEach((v) => {
                            const crudValue = this.getCRUDValue(v.value);
                            if (v.property && v.operator) {
                                permissionDescriptions.push(
                                    new CreatePermissionDescription(
                                        Number(v.property),
                                        v.operator,
                                        v.value && (v.value as PermissionFormData).IsRequired ? 1 : 0,
                                        crudValue,
                                        v.value && (v.value as PermissionFormData).comment
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
        if (this.state.permissionManager) {
            this.state.permissionManager.unregisterListener(this.formListenerId);
        }
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

    private getCRUDValue(permissionData: PermissionFormData): number {
        const value: number = permissionData ? (permissionData.CREATE ? CRUD.CREATE : 0)
            + (permissionData.READ ? CRUD.READ : 0)
            + (permissionData.UPDATE ? CRUD.UPDATE : 0)
            + (permissionData.DELETE ? CRUD.DELETE : 0)
            + (permissionData.DENY ? CRUD.DENY : 0) : 0;
        return value;
    }
}

module.exports = Component;
