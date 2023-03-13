/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { IdService } from '../../../../../model/IdService';
import { CreatePermissionDescription } from '../../../server/CreatePermissionDescription';
import { PermissionFormData } from '../../../../base-components/webapp/core/PermissionFormData';
import { IDynamicFormManager } from '../../../../base-components/webapp/core/dynamic-form';
import { Permission } from '../../../model/Permission';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { CRUD } from '../../../../../../../server/model/rest/CRUD';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { BasePermission } from '../../../model/BasePermission';
import { BasePermissionManager } from '../../core/admin/BasePermissionManager';

class Component extends FormInputComponent<any[],
    ComponentState> {

    private formListenerId: string;
    private permissionFormTimeout: any;

    public async onCreate(): Promise<void> {
        this.state = new ComponentState();
        this.formListenerId = IdService.generateDateBasedId('permission-form-listener-');
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        const permissionManager = new BasePermissionManager();

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

                    if (await this.state.permissionManager.hasDefinedValues()) {
                        const values = await this.state.permissionManager.getEditableValues();

                        values.forEach((v) => {
                            let crudValue = CRUD.READ;
                            if (v.operator === BasePermission.WRITE) {
                                crudValue = CRUD.CREATE | CRUD.UPDATE | CRUD.DELETE;
                            } else if (v.operator === BasePermission.READ_WRITE) {
                                crudValue = CRUD.READ | CRUD.CREATE | CRUD.UPDATE | CRUD.DELETE;
                            }

                            if (v.property && v.operator) {
                                const permission = new CreatePermissionDescription(
                                    null, '', 0, crudValue, null, Number(v.property),
                                    typeof v.id !== 'undefined' && v.id !== null ? Number(v.id) : null
                                );
                                permissionDescriptions.push(permission);
                            }
                        }

                        );
                        super.provideValue(permissionDescriptions, true);
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

    public async setCurrentValue(): Promise<void> {
        return;
    }

    public async setCurrentNode(permissionManager: IDynamicFormManager): Promise<void> {
        const permissionDescriptions: CreatePermissionDescription[] = [];
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<number>(this.state.field?.instanceId);

        if (value && Array.isArray(value.value)) {
            const permissions = value.value as Permission[];
            for (const permission of permissions) {
                let operator;

                if (permission.Value === CRUD.READ) {
                    operator = BasePermission.READ;
                } else if (permission.Value === (CRUD.CREATE | CRUD.UPDATE | CRUD.DELETE)) {
                    operator = BasePermission.WRITE;
                } else {
                    operator = BasePermission.READ_WRITE;
                }

                const permissionValue = new ObjectPropertyValue(
                    permission.RoleID.toString(), operator, 0,
                    [], false, true, null, null, null, permission.ID.toString()
                );
                permissionManager.setValue(permissionValue);
                permissionDescriptions.push(new CreatePermissionDescription(permission.TypeID,
                    permission.Target,
                    permission.IsRequired,
                    permission.Value,
                    permission.Comment,
                    null,
                    permission.ID));
            }
        }
    }
}

module.exports = Component;