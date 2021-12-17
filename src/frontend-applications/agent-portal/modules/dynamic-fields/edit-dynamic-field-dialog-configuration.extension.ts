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
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration';
import { DynamicFieldProperty } from './model/DynamicFieldProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../base-components/webapp/core/ObjectReferenceOptions';
import { TreeNode } from '../base-components/webapp/core/tree';
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { EditDynamicFieldDialogContext } from './webapp/core/EditDynamicFieldDialogContext';

import { KIXExtension } from '../../../../server/model/KIXExtension';
import { DefaultSelectInputFormOption } from '../../model/configuration/DefaultSelectInputFormOption';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditDynamicFieldDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const widget = new WidgetConfiguration(
            'dynamic-field-edit-dialog-widget', 'Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Dynamic Field', [], null, null,
            false, false, 'kix-icon-edit-gear'
        );
        configurations.push(widget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'dynamic-field-edit-dialog-widget', 'dynamic-field-edit-dialog-widget',
                        KIXObjectType.DYNAMIC_FIELD, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'dynamic-field-edit-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'dynamic-field-edit-form-field-name',
                'Translatable#Name', DynamicFieldProperty.NAME, null, true,
                'Translatable#Helptext_Admin_DynamicFieldCreate_Name'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'dynamic-field-edit-form-field-label',
                'Translatable#Label', DynamicFieldProperty.LABEL, null, true,
                'Translatable#Helptext_Admin_DynamicFieldCreate_Label'
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'dynamic-field-edit-form-field-type',
                'Translatable#Field Type', DynamicFieldProperty.FIELD_TYPE, 'object-reference-input', true,
                'Translatable#Helptext_Admin_DynamicFieldCreate_FieldType',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.DYNAMIC_FIELD_TYPE),
                    new FormFieldOption(ObjectReferenceOptions.USE_OBJECT_SERVICE, true),
                ], null, null, null, null, null, null, null, null, null, null, null, null, true
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'dynamic-field-edit-form-field-object-type',
                'Translatable#Object Type', DynamicFieldProperty.OBJECT_TYPE, 'default-select-input', true,
                'Translatable#Helptext_Admin_DynamicFieldCreate_ObjectType',
                [
                    new FormFieldOption(DefaultSelectInputFormOption.NODES, [
                        new TreeNode(KIXObjectType.CONTACT, 'Contact', 'kix-icon-man-bubble'),
                        new TreeNode(KIXObjectType.FAQ_ARTICLE, 'FAQ', 'kix-icon-faq'),
                        new TreeNode(KIXObjectType.ORGANISATION, 'Organisation', 'kix-icon-organisation'),
                        new TreeNode(KIXObjectType.TICKET, 'Ticket', 'kix-icon-ticket')
                    ])
                ], null, null, null, null, null, null, null, null, null, null, null, null, true
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'dynamic-field-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_Admin_DynamicFieldCreate_Validity',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ],
                new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormFieldConfiguration(
                'dynamic-field-edit-form-field-config',
                'Translatable#Configuration', DynamicFieldProperty.CONFIG,
                'dynamic-form-config-input', true, 'Translatable#Helptext_Admin_DynamicFieldCreate_Config'
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'dynamic-field-edit-form-group-information', 'Translatable#Field Information',
                [
                    'dynamic-field-edit-form-field-name',
                    'dynamic-field-edit-form-field-label',
                    'dynamic-field-edit-form-field-type',
                    'dynamic-field-edit-form-field-object-type',
                    'dynamic-field-edit-form-field-customer-visible',
                    'dynamic-field-edit-form-field-valid',
                    'dynamic-field-edit-form-field-config',
                ], null,
                [
                    new FormFieldConfiguration(
                        'dynamic-field-edit-form-field-customer-visible',
                        'Translatable#Show in Customer Portal', DynamicFieldProperty.CUSTOMER_VISIBLE,
                        'checkbox-input', false, 'Translatable#Helptext_Admin_DynamicFieldCreate_CustomerVisible'
                    )
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'dynamic-field-edit-form-page', 'Translatable#Edit Dynamic Field',
                ['dynamic-field-edit-form-group-information']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Dynamic Field', ['dynamic-field-edit-form-page'],
                KIXObjectType.DYNAMIC_FIELD, true,
                FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.DYNAMIC_FIELD, formId);
        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
