/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import {
    EditConfigItemClassDialogContext
} from './webapp/core/admin/context/ci-class/EditConfigItemClassDialogContext';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { ConfigItemClassProperty } from './model/ConfigItemClassProperty';
import { KIXObjectProperty } from '../../model/kix/KIXObjectProperty';
import { FormFieldOption } from '../../model/configuration/FormFieldOption';
import { ObjectReferenceOptions } from '../../modules/base-components/webapp/core/ObjectReferenceOptions';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditConfigItemClassDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const editDialogWidget = new WidgetConfiguration(
            'cmdb-ci-class-edit-dialog-widget', 'Edit Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Class', [], null, null,
            false, false, 'kix-icon-edit'
        );
        configurations.push(editDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'cmdb-ci-class-edit-dialog-widget', 'cmdb-ci-class-edit-dialog-widget',
                        KIXObjectType.CONFIG_ITEM_CLASS, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'cmdb-ci-class-edit-form';
        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-ci-class-edit-form-field-name',
                'Translatable#Name', ConfigItemClassProperty.NAME, null, true,
                'Translatable#Helptext_CMDB_ConfigItemClassCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-ci-class-edit-form-field-icon',
                'Translatable#Icon', ConfigItemClassProperty.ICON, 'icon-input', false,
                'Translatable#Helptext_CMDB_ConfigItemClassCreate_Icon'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-ci-class-edit-form-field-definition',
                'Translatable#Class Definition', ConfigItemClassProperty.DEFINITION_STRING, 'text-area-input', true,
                'Translatable#Helptext_CMDB_ConfigItemClassCreate_Definition',
                null, null, null, null, null, null, null
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-ci-class-edit-form-field-comment',
                'Translatable#Comment', ConfigItemClassProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_CMDB_ConfigItemClassCreate_Comment',
                null, null, null, null, null, null, null, null, 200
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-ci-class-edit-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_CMDB_ConfigItemClassCreate_Valid',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ]
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'cmdb-ci-class-edit-form-group-information', 'Translatable#CI Class Information',
                [
                    'cmdb-ci-class-edit-form-field-name',
                    'cmdb-ci-class-edit-form-field-icon',
                    'cmdb-ci-class-edit-form-field-definition',
                    'cmdb-ci-class-edit-form-field-comment',
                    'cmdb-ci-class-edit-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'cmdb-ci-class-edit-form-page', 'Translatable#Edit CI Class',
                ['cmdb-ci-class-edit-form-group-information']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit CI Class',
                ['cmdb-ci-class-edit-form-page'],
                KIXObjectType.CONFIG_ITEM_CLASS, true, FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.EDIT], KIXObjectType.CONFIG_ITEM_CLASS, formId
        );
        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
