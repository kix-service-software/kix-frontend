/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { NewTranslationDialogContext } from './webapp/core/admin/context';
import { IConfiguration } from '../../model/configuration/IConfiguration';
import { WidgetConfiguration } from '../../model/configuration/WidgetConfiguration';
import { ConfigurationType } from '../../model/configuration/ConfigurationType';
import { ContextConfiguration } from '../../model/configuration/ContextConfiguration';
import { ConfiguredDialogWidget } from '../../model/configuration/ConfiguredDialogWidget';
import { KIXObjectType } from '../../model/kix/KIXObjectType';
import { ContextMode } from '../../model/ContextMode';
import { FormFieldConfiguration } from '../../model/configuration/FormFieldConfiguration';
import { TranslationPatternProperty } from './model/TranslationPatternProperty';
import { FormGroupConfiguration } from '../../model/configuration/FormGroupConfiguration';
import { FormPageConfiguration } from '../../model/configuration/FormPageConfiguration';
import { FormConfiguration } from '../../model/configuration/FormConfiguration';
import { FormContext } from '../../model/configuration/FormContext';
import { ModuleConfigurationService } from '../../server/services/configuration';

import { KIXExtension } from '../../../../server/model/KIXExtension';

class Extension extends KIXExtension implements IConfigurationExtension {

    public getModuleId(): string {
        return NewTranslationDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];
        const newDialogWidget = new WidgetConfiguration(
            'i18n-translation-new-dialog-widget', 'NEw DIalog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#New Translation', [], null, null,
            false, false, 'kix-icon-new-gear'
        );
        configurations.push(newDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'i18n-translation-new-dialog-widget', 'i18n-translation-new-dialog-widget',
                        KIXObjectType.TRANSLATION_PATTERN, ContextMode.CREATE_ADMIN
                    )
                ], [], [], [], []
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
        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.NEW], KIXObjectType.TRANSLATION_PATTERN, formId
        );

        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
