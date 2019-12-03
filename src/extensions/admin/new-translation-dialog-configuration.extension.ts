/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../core/extensions';
import { NewTranslationDialogContext } from '../../core/browser/i18n/admin/context';
import {
    KIXObjectType, FormContext, ContextConfiguration,
    TranslationPatternProperty,
    ConfiguredDialogWidget, ContextMode, WidgetConfiguration
} from '../../core/model';
import { ConfigurationService } from '../../core/services';
import {
    FormGroupConfiguration, FormConfiguration, FormFieldConfiguration, FormPageConfiguration
} from '../../core/model/components/form/configuration';
import { ConfigurationType, IConfiguration } from '../../core/model/configuration';
import { ModuleConfigurationService } from '../../services';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTranslationDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const newDialogWidget = new WidgetConfiguration(
            'i18n-translation-new-dialog-widget', 'NEw DIalog Widget', ConfigurationType.Widget,
            'new-translation-dialog', 'Translatable#New Translation', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        configurations.push(newDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [], [], [], [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'i18n-translation-new-dialog-widget', 'i18n-translation-new-dialog-widget',
                        KIXObjectType.TRANSLATION_PATTERN, ContextMode.CREATE_ADMIN
                    )
                ]
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const configurations = [];

        const formId = 'i18n-translation-new-form';

        configurations.push(
            new FormFieldConfiguration(
                'i18n-translation-new-form-field-pattern',
                'Translatable#Pattern', TranslationPatternProperty.VALUE, 'text-area-input', true,
                'Translatable#Helptext_i18n_TranslationPatternCreate_Pattern'
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'i18n-translation-new-form-group-pattern', 'Translatable#Translations',
                [
                    'i18n-translation-new-form-field-pattern'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'i18n-translation-new-form-page', 'Translatable#New Translations',
                ['i18n-translation-new-form-group-pattern']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#New Translation',
                [
                    'i18n-translation-new-form-page'
                ],
                KIXObjectType.TRANSLATION_PATTERN
            )
        );
        ConfigurationService.getInstance().registerForm([FormContext.NEW], KIXObjectType.TRANSLATION_PATTERN, formId);

        return configurations;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
