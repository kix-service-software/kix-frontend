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
                'Translatable#Pattern', TranslationPatternProperty.VALUE, 'text-area-input', true, 'Translatable#Please insert a base string for the translation.'
            ));

            const languages = await this.getLanguages();
            languages.sort((a, b) => SortUtil.compareString(a[1], b[1])).forEach((l) => {
                const languageField = new FormField(
                    l[1], l[0], 'text-area-input', false,
                    `Translatable#Please select a language for the translation.`
                );
                languageField.placeholder = 'Translatable#Translation';
                fields.push(languageField);
            });

            const group = new FormGroup('Translatable#Translations', fields);

            const form = new Form(
                formId, 'Translatable#Edit Translation', [group],
                KIXObjectType.TRANSLATION_PATTERN, true, FormContext.EDIT
            );
            await configurationService.saveConfiguration(form.id, form);
        }
        configurationService.registerForm([FormContext.EDIT], KIXObjectType.TRANSLATION_PATTERN, formId);
    }

    private async getLanguages(): Promise<Array<[string, string]>> {
        const configurationService = ConfigurationService.getInstance();
        const token = configurationService.getServerConfiguration().BACKEND_API_TOKEN;

        const service = KIXObjectServiceRegistry.getServiceInstance(KIXObjectType.SYS_CONFIG_OPTION);
        const languagesConfig = await service.loadObjects<SysConfigOption>(
            token, null, KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.DEFAULT_USED_LANGUAGES], null, null
        );

        const languages: Array<[string, string]> = [];
        if (languagesConfig && languagesConfig.length) {
            for (const lang in languagesConfig[0].Value) {
                if (languagesConfig[0].Value[lang]) {
                    languages.push([lang, languagesConfig[0].Value[lang]]);
                }
            }
        }
        return languages;
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
