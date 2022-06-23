/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NewConfigItemClassDialogContext } from './webapp/core';
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
import { FormFieldValue } from '../../model/configuration/FormFieldValue';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration/ModuleConfigurationService';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewConfigItemClassDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const newDialogWidget = new WidgetConfiguration(
            'cmdb-ci-class-new-dialog-widget', 'Dialog WIdget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Class', [], null, null, false, false,
            'kix-icon-new-gear'
        );
        configurations.push(newDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'cmdb-ci-class-new-dialog-widget', 'cmdb-ci-class-new-dialog-widget',
                        KIXObjectType.CONFIG_ITEM_CLASS, ContextMode.CREATE_ADMIN
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];
        const formId = 'cmdb-ci-class-new-form';

        configurations.push(
            new FormFieldConfiguration(
                'cmdb-ci-class-new-form-field-name',
                'Translatable#Name', ConfigItemClassProperty.NAME, null, true,
                'Translatable#Helptext_CMDB_ConfigItemClassCreate_Name'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-ci-class-new-form-field-icon',
                'Translatable#Icon', ConfigItemClassProperty.ICON, 'icon-input', false,
                'Translatable#Helptext_CMDB_ConfigItemClassCreate_Icon'
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-ci-class-new-form-field-definition',
                'Translatable#Class Definition', ConfigItemClassProperty.DEFINITION_STRING, 'text-area-input', true,
                'Translatable#Helptext_CMDB_ConfigItemClassCreate_Definition',
                null, null, null, null, null, null, null
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-ci-class-new-form-field-comment',
                'Translatable#Comment', ConfigItemClassProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_CMDB_ConfigItemClassCreate_Comment',
                null, null, null, null, null, null, null, null, 200
            )
        );
        configurations.push(
            new FormFieldConfiguration(
                'cmdb-ci-class-new-form-field-valid',
                'Translatable#Validity', KIXObjectProperty.VALID_ID,
                'object-reference-input', true, 'Translatable#Helptext_CMDB_ConfigItemClassCreate_Valid',
                [
                    new FormFieldOption(ObjectReferenceOptions.OBJECT, KIXObjectType.VALID_OBJECT)
                ],
                new FormFieldValue(1)
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'cmdb-ci-class-new-form-group-information', 'Translatable#CI Class Information',
                [
                    'cmdb-ci-class-new-form-field-name',
                    'cmdb-ci-class-new-form-field-icon',
                    'cmdb-ci-class-new-form-field-definition',
                    'cmdb-ci-class-new-form-field-comment',
                    'cmdb-ci-class-new-form-field-valid'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'cmdb-ci-class-new-form-page', 'Translatable#Add CI Class',
                ['cmdb-ci-class-new-form-group-information']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Add CI Class',
                ['cmdb-ci-class-new-form-page'],
                KIXObjectType.CONFIG_ITEM_CLASS
            )
        );
        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.NEW], KIXObjectType.CONFIG_ITEM_CLASS, formId)
            ;
        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
