/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FilterCriteria } from '../../../../../../model/FilterCriteria';
import { FilterDataType } from '../../../../../../model/FilterDataType';
import { FilterType } from '../../../../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { TreeNode } from '../../../../../base-components/webapp/core/tree';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';
import { FormValueProperty } from '../../../../../object-forms/model/FormValueProperty';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { SearchOperator } from '../../../../../search/model/SearchOperator';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { Role } from '../../../../../user/model/Role';
import { RoleProperty } from '../../../../../user/model/RoleProperty';
import { User } from '../../../../../user/model/User';
import { UserProperty } from '../../../../../user/model/UserProperty';
import { UserPreferencesFormValue } from './UserPreferencesFormValue';

export class UserAccessFormValue extends SelectObjectFormValue<string[]> {

    protected rolesFormValue: SelectObjectFormValue;

    public constructor(
        property: string,
        public user: User,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, user, objectValueMapper, parent);
        this.maxSelectCount = -1;
        this.visible = true;
        this.label = 'Translatable#Access';

        this.setNewInitialState(FormValueProperty.VISIBLE, true);

        const loginFormValue = new ObjectFormValue(
            UserProperty.USER_LOGIN, user, objectValueMapper, this
        );
        this.formValues.push(loginFormValue);

        const passwordFormValue = new ObjectFormValue(
            UserProperty.USER_PASSWORD, user, objectValueMapper, this
        );
        passwordFormValue.label = 'Translatable#Password';
        passwordFormValue.isPassword = true;
        this.formValues.push(passwordFormValue);

        this.rolesFormValue = new SelectObjectFormValue(
            UserProperty.ROLE_IDS, user, objectValueMapper, this
        );
        this.rolesFormValue.label = 'Translatable#Roles';
        this.rolesFormValue.objectType = KIXObjectType.ROLE;
        this.rolesFormValue.maxSelectCount = -1;
        this.formValues.push(this.rolesFormValue);

        const preferencesFormValue = new UserPreferencesFormValue(
            UserProperty.PREFERENCES, user, objectValueMapper, this
        );
        this.formValues.push(preferencesFormValue);

        this.formValues.forEach((fv) => {
            fv.visible = true;
            fv.setNewInitialState(FormValueProperty.VISIBLE, true);
        });

        const value = [];
        if (user.IsAgent) {
            value.push(UserProperty.IS_AGENT);
        }
        if (user.IsCustomer) {
            value.push(UserProperty.IS_CUSTOMER);
        }
        this.value = value;
    }

    public async initFormValue(): Promise<void> {
        await super.initFormValue();
        await this.setUserFields();

        this.addPropertyBinding(FormValueProperty.VALUE, async (value: UserAccessFormValue) => {
            await this.setUserFields();
            await this.setRoles();
        });
    }

    private async setUserFields(): Promise<void> {
        if (this.value?.length) {
            for (const fv of this.formValues) {
                await fv.enable();
            }
        } else {
            for (const fv of this.formValues) {
                await fv.disable();
            }
        }
    }

    private async setRoles(): Promise<void> {
        let roleValue = this.rolesFormValue.value;
        if (!Array.isArray(roleValue)) {
            roleValue = [];
        }

        const roleNames = [];
        if (this.user.IsAgent) {
            roleNames.push('Agent User');
        }

        if (this.user.IsCustomer) {
            roleNames.push('Customer');
        }

        if (roleNames.length) {
            const roles = await this.loadRoles(roleNames);
            for (const role of roles) {
                if (!roleValue.some((rid) => rid === role.ID)) {
                    roleValue.push(role.ID);
                }
            }
        }

        this.rolesFormValue.setFormValue(roleValue);
    }

    private async loadRoles(names: string[]): Promise<Role[]> {
        const roles = await KIXObjectService.loadObjects<Role>(
            KIXObjectType.ROLE, null, new KIXObjectLoadingOptions([
                new FilterCriteria(
                    RoleProperty.NAME, SearchOperator.IN, FilterDataType.STRING, FilterType.AND, names
                )
            ])
        ).catch(() => []);

        return roles;
    }



    public async setObjectValue(value: string[]): Promise<void> {
        this.user.IsAgent = value?.some((v) => v === UserProperty.IS_AGENT) ? 1 : 0;
        this.user.IsCustomer = value?.some((v) => v === UserProperty.IS_CUSTOMER) ? 1 : 0;
    }

    public async loadSelectableValues(): Promise<void> {
        const agentLabel = await TranslationService.translate('Translatable#Agent Portal');
        const customerLabel = await TranslationService.translate('Translatable#Customer Portal');
        const nodes = [
            new TreeNode(
                UserProperty.IS_AGENT, agentLabel,
                new ObjectIcon(null, 'agent-portal-icon-sw', 'agent-portal-icon-sw')
            ),
            new TreeNode(UserProperty.IS_CUSTOMER, customerLabel, 'fas fa-users')
        ];

        this.treeHandler?.setTree(nodes, null, true, true);
    }

    public async loadSelectedValues(): Promise<void> {
        if (Array.isArray(this.value) && this.value?.length) {
            const selectedNodes = [];
            for (const v of this.value) {
                const label = v === UserProperty.IS_AGENT ? 'Agent Portal' : 'Self Service Portal';
                const icon = v === UserProperty.IS_AGENT
                    ? new ObjectIcon(null, 'agent-portal-icon-sw', 'agent-portal-icon-sw')
                    : 'fas fa-users';
                const node = new TreeNode(v, label, icon);
                selectedNodes.push(node);
            }
            this.selectedNodes = selectedNodes.sort((a, b) => a.Name - b.Name);
        } else {
            this.treeHandler.selectNone();
            this.selectedNodes = [];
        }
    }

}