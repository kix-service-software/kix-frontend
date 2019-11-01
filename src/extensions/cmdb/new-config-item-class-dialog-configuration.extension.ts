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
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewConfigItemClassDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const newDialogWidget = new WidgetConfiguration(
            'cmdb-ci-class-new-dialog-widget', 'Dialog WIdget', ConfigurationType.Widget,
            'new-config-item-class-dialog', 'Translatable#New Class', [], null, null, false, false,
            'kix-icon-new-gear'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(newDialogWidget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'cmdb-ci-class-new-dialog-widget', 'cmdb-ci-class-new-dialog-widget',
                    KIXObjectType.CONFIG_ITEM_CLASS, ContextMode.CREATE_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {

        const formId = 'cmdb-ci-class-new-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-ci-class-new-form-field-name',
                'Translatable#Name', ConfigItemClassProperty.NAME, null, true,
                'Translatable#Helptext_CMDB_ConfigItemClassCreate_Name'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-ci-class-new-form-field-icon',
                'Translatable#Icon', ConfigItemClassProperty.ICON, 'icon-input', false,
                'Translatable#Helptext_CMDB_ConfigItemClassCreate_Icon'
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-ci-class-new-form-field-definition',
                'Translatable#Class Definition', ConfigItemClassProperty.DEFINITION_STRING, 'text-area-input', true,
                'Translatable#Helptext_CMDB_ConfigItemClassCreate_Definition',
                null, null, null, null, null, null, null
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'cmdb-ci-class-new-form-field-comment',
                'Translatable#Comment', ConfigItemClassProperty.COMMENT, 'text-area-input', false,
                'Translatable#Helptext_CMDB_ConfigItemClassCreate_Comment',
                null, null, null, null, null, null, null, 200
            )
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
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

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Add CI Class',
                [
                    'cmdb-ci-class-new-form-group-information'
                ],
                KIXObjectType.CONFIG_ITEM_CLASS
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.CONFIG_ITEM_CLASS, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
