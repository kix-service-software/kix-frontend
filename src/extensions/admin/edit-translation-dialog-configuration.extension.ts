/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { EditTranslationDialogContext } from '../../core/browser/i18n/admin/context';
import {
    ContextConfiguration, KIXObjectType, FormContext,
    TranslationPatternProperty, WidgetConfiguration, ConfiguredDialogWidget, ContextMode
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormFieldConfiguration, FormConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationType } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTranslationDialogContext.CONTEXT_ID;
    }

    public async createDefaultConfiguration(): Promise<ContextConfiguration> {

        const editDialogWidget = new WidgetConfiguration(
            'i18n-translation-edit-dialog-widget', 'Edit Dialog Widget', ConfigurationType.Widget,
            'edit-translation-dialog', 'Translatable#Edit Translation', [], null, null,
            false, false, 'kix-icon-edit'
        );
        await ModuleConfigurationService.getInstance().saveConfiguration(editDialogWidget);

        return new ContextConfiguration(
            this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
            this.getModuleId(), [], [], [], [], [], [], [], [],
            [
                new ConfiguredDialogWidget(
                    'i18n-translation-edit-dialog-widget', 'i18n-translation-edit-dialog-widget',
                    KIXObjectType.TRANSLATION_PATTERN, ContextMode.EDIT_ADMIN
                )
            ]
        );
    }

    public async createFormConfigurations(overwrite: boolean): Promise<void> {
        const formId = 'i18n-translation-edit-form';

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormFieldConfiguration(
                'i18n-translation-edit-form-field-pattern',
                'Translatable#Pattern', TranslationPatternProperty.VALUE, 'text-area-input', true,
                'Translatable#Helptext_i18n_TranslationPatternCreate_Pattern'
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormGroupConfiguration(
                'i18n-translation-edit-form-group-pattern', 'Translatable#Translations',
                [
                    'i18n-translation-edit-form-field-pattern'
                ]
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormPageConfiguration(
                'i18n-translation-edit-form-page', 'Translatable#Edit Translation',
                ['i18n-translation-edit-form-group-pattern']
            )
        );

        await ModuleConfigurationService.getInstance().saveConfiguration(
            new FormConfiguration(
                formId, 'Translatable#Edit Translation',
                [
                    'i18n-translation-edit-form-page'
                ],
                KIXObjectType.TRANSLATION_PATTERN, true, FormContext.EDIT
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.EDIT], KIXObjectType.TRANSLATION_PATTERN, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
