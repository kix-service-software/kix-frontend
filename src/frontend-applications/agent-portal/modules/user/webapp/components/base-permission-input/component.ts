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
import { IDynamicFormManager } from '../../../../base-components/webapp/core/dynamic-form';
import { ObjectPropertyValue } from '../../../../../model/ObjectPropertyValue';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { BasePermissionManager } from '../../core/admin/BasePermissionManager';
import { PermissionDescription } from '../../../../../model/PermissionDescription';

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
                    const permissionDescriptions: PermissionDescription[] = [];

                    if (await this.state.permissionManager.hasDefinedValues()) {
                        const values = await this.state.permissionManager.getEditableValues();

                        for (const v of values) {
                            if (v.property && v.operator) {
                                const roleId = Number(v.property);
                                const permission = new PermissionDescription('Base', roleId, v.operator);
                                permissionDescriptions.push(permission);
                            }
                        }

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
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<number>(this.state.field?.instanceId);

        if (value && Array.isArray(value.value)) {
            const permissions = value.value as PermissionDescription[];
            for (const permission of permissions) {
                const operator = permission.Permission;

                const permissionValue = new ObjectPropertyValue(
                    permission.RoleID.toString(), operator, 0,
                    [], false, true, null, null, null, permission.RoleID.toString()
                );
                permissionManager.setValue(permissionValue);
            }
        }
    }
}

module.exports = Component;