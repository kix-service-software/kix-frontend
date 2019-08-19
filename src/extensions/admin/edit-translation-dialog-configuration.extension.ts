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
    ContextConfiguration, ConfiguredWidget, FormField,
    SortUtil, Form, KIXObjectType, FormContext, SysConfigKey, SysConfigOption, TranslationPatternProperty
} from '../../core/model';
import { ConfigurationService, KIXObjectServiceRegistry } from '../../core/services';
import { FormGroup } from '../../core/model/components/form/FormGroup';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return EditTranslationDialogContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const sidebars = [];
        const sidebarWidgets: Array<ConfiguredWidget<any>> = [];

        return new ContextConfiguration(this.getModuleId(), sidebars, sidebarWidgets);
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        const configurationService = ConfigurationService.getInstance();

        const formId = 'edit-translation-form';
        const existing = configurationService.getConfiguration(formId);
        if (!existing) {
            const fields: FormField[] = [];

            fields.push(new FormField(
                // tslint:disable-next-line:max-line-length
                'Translatable#Pattern', TranslationPatternProperty.VALUE, 'text-area-input', true, 'Translatable#Helptext_i18n_TranslationPatternEdit_Pattern'
            ));

            const group = new FormGroup('Translatable#Translations', fields);

            const form = new Form(
                formId, 'Translatable#Edit Translation', [group],
                KIXObjectType.TRANSLATION_PATTERN, true, FormContext.EDIT
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.TRANSLATION_PATTERN, formId);
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
