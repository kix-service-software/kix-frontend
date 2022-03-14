/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfigurationExtension } from '../../server/extensions/IConfigurationExtension';
import { EditTranslationDialogContext } from './webapp/core/admin/context';
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
        return EditTranslationDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<IConfiguration[]> {
        const configurations = [];

        const editDialogWidget = new WidgetConfiguration(
            'i18n-translation-edit-dialog-widget', 'Edit Dialog Widget', ConfigurationType.Widget,
            'object-dialog-form-widget', 'Translatable#Edit Translation', [], null, null,
            false, false, 'kix-icon-edit'
        );
        configurations.push(editDialogWidget);

        configurations.push(
            new ContextConfiguration(
                this.getModuleId(), this.getModuleId(), ConfigurationType.Context,
                this.getModuleId(), [], [], [],
                [
                    new ConfiguredDialogWidget(
                        'i18n-translation-edit-dialog-widget', 'i18n-translation-edit-dialog-widget',
                        KIXObjectType.TRANSLATION_PATTERN, ContextMode.EDIT_ADMIN
                    )
                ], [], [], [], []
            )
        );
        return configurations;
    }

    public async getFormConfigurations(): Promise<IConfiguration[]> {
        const formId = 'i18n-translation-edit-form';

        const configurations = [];
        configurations.push(
            new FormFieldConfiguration(
                'i18n-translation-edit-form-field-pattern',
                'Translatable#Pattern', TranslationPatternProperty.VALUE, 'text-area-input', true,
                'Translatable#Helptext_i18n_TranslationPatternCreate_Pattern'
            )
        );

        configurations.push(
            new FormGroupConfiguration(
                'i18n-translation-edit-form-group-pattern', 'Translatable#Translations',
                [
                    'i18n-translation-edit-form-field-pattern'
                ]
            )
        );

        configurations.push(
            new FormPageConfiguration(
                'i18n-translation-edit-form-page', 'Translatable#Edit Translation',
                ['i18n-translation-edit-form-group-pattern']
            )
        );

        configurations.push(
            new FormConfiguration(
                formId, 'Translatable#Edit Translation',
                [
                    'i18n-translation-edit-form-page'
                ],
                KIXObjectType.TRANSLATION_PATTERN, true, FormContext.EDIT
            )
        );
        ModuleConfigurationService.getInstance().registerForm(
            [FormContext.EDIT], KIXObjectType.TRANSLATION_PATTERN, formId
        );

        return configurations;
    }

}

module.exports = (data, host, options): Extension => {
    return new Extension();
};
