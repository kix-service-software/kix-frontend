/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */


import {
    ContextConfiguration, ConfigItemClassProperty, FormFieldValue,
    KIXObjectType, FormContext, FormFieldOption, KIXObjectProperty,
    ObjectReferenceOptions, WidgetConfiguration, ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import { IConfigurationExtension } from '../../core/extensions';
import { ConfigurationService } from '../../core/services';
import { NewConfigItemClassDialogContext } from '../../core/browser/cmdb';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationType, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewConfigItemClassDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const newDialogWidget = new WidgetConfiguration(
            'cmdb-ci-class-new-dialog-widget', 'Dialog WIdget', ConfigurationType.Widget,
            'new-config-item-class-dialog', 'Translatable#New Class', [], null, null, false, false,
            'kix-icon-new-gear'
        );
        configurations.push(newDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'cmdb-ci-class-new-dialog-widget', 'cmdb-ci-class-new-dialog-widget',
                        KIXObjectType.CONFIG_ITEM_CLASS, ContextMode.CREATE_ADMIN
                    )
                ]
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
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.CONFIG_ITEM_CLASS, formId);
        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
