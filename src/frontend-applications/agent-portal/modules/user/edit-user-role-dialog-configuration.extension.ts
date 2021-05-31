/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { RoleProperty } from './model/RoleProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration';
import { DefaultSelectInputFormOption } from '../../model/configuration/DefaultSelectInputFormOption';
import { TreeNode } from '../base-components/webapp/core/tree';
import { RoleUsageContextTypes } from './model/RoleUsageContextTypes';
import { FormFieldOptions } from '../../model/configuration/FormFieldOptions';

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { EditUserRoleDialogContext } from './webapp/core/admin/context/EditUserRoleDialogContext';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditUserRoleDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const widget = new WidgetConfiguration(
            'user-role-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Role', [], null, null,
            false, false, 'kix-icon-edit'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), 'Edit User Role Dialog', ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'user-role-edit-dialog-widget', 'user-role-edit-dialog-widget',
                        KIXObjectType.ROLE, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );

        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];

        const formId = 'user-role-edit-form';

        const usageContextField = new FormFieldConfiguration(
            'user-role-edit-form-field-usage-context',
            'Translatable#Usage Context', RoleProperty.USAGE_CONTEXT, 'default-select-input', true,
            'Translatable#Helptext_Admin_Users_RoleCreate_UsageContext',
            [
                new FormFieldOption(DefaultSelectInputFormOption.NODES,
                    [
                        new TreeNode(RoleUsageContextTypes.AGENT, 'Translatable#Agent'),
                        new TreeNode(RoleUsageContextTypes.CUSTOMER, 'Translatable#Customer'),
                    ]),
                new FormFieldOption(DefaultSelectInputFormOption.MULTI, true)
            ]
        );
        configurations.push(usageContextField);

        const nameField = new FormFieldConfiguration(
            'user-role-edit-form-field-name',
            'Translatable#Name', RoleProperty.NAME, null, true,
            'Translatable#Helptext_Admin_Users_RoleCreate_Name'
        );
        configurations.push(nameField);

        const commentField = new FormFieldConfiguration(
            'user-role-edit-form-field-comment',
            'Translatable#Comment', RoleProperty.COMMENT, 'text-area-input', false,
            'Translatable#Helptext_Admin_Users_RoleCreate_Comment',
            null, null, null, null, null, null, null, null, 250
        );
        configurations.push(commentField);

        const validField = new FormFieldConfiguration(
            'user-role-edit-form-field-validity',
            'Translatable#Validity', KIXObjectProperty.VALID_ID,
            'object-reference-input', true, 'Translatable#Helptext_Admin_Users_RoleCreate_Valid',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
            ], new FormFieldValue(1)
        );
        configurations.push(validField);

        const infoGroup = new FormGroupConfiguration(
            'user-role-edit-form-group-role-information', 'Translatable#Role Information',
            [
                'user-role-edit-form-field-name',
                'user-role-edit-form-field-usage-context',
                'user-role-edit-form-field-comment',
                'user-role-edit-form-field-validity'
            ]
        );
        configurations.push(infoGroup);

        const permissionField = new FormFieldConfiguration(
            'user-role-edit-form-field-permissions',
            null, RoleProperty.PERMISSIONS, 'permissions-form-input', false, null
        );
        configurations.push(permissionField);

        const permissionGroup = new FormGroupConfiguration(
            'user-role-edit-form-group-permissions', 'Translatable#Permissions',
            [
                'user-role-edit-form-field-permissions'
            ]
        );
        configurations.push(permissionGroup);

        const agentsField = new FormFieldConfiguration(
            'user-role-edit-form-field-agents',
            'Translatable#Agents', RoleProperty.USER_IDS, 'object-reference-input', false,
            'Translatable#Helptext_Admin_Users_RoleCreate_User',
            [
                new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.USER),
                new FormFieldOption(ObjectReferenceOptions.MULTISELECT, true),
                new FormFieldOption(FormFieldOptions.INVALID_CLICKABLE, true),
                new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE, true),
                new FormFieldOption(ObjectReferenceOptions.AUTOCOMPLETE_PRELOAD_PATTERN, '*')
            ]
        );
        configurations.push(agentsField);

        const agentsGroup = new FormGroupConfiguration(
            'user-role-edit-form-group-agents', 'Translatable#Agent Assignment',
            [
                'user-role-edit-form-field-agents'
            ]
        );
        configurations.push(agentsGroup);

        configurations.push(
            new FormPageConfiguration(
                'user-role-edit-form-group-page', 'Translatable#Edit Role',
                [
                    'user-role-edit-form-group-role-information',
                    'user-role-edit-form-group-permissions',
                    'user-role-edit-form-group-agents'
                ]
            )
        );

        const form = new FormConfiguration(
            formId, 'Translatable#Edit Role',
            ['user-role-edit-form-group-page'],
            KIXObjectType.ROLE, true, FormContext.EDIT
        );
        configurations.push(form);
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.ROLE, formId);

        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
