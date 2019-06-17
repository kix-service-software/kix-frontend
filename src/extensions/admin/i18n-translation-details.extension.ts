import { IConfigurationExtension } from '../../core/extensions';
import {
    WidgetConfiguration, ConfiguredWidget, WidgetSize, ContextConfiguration,
} from '../../core/model/';
import { TranslationDetailsContext } from '../../core/browser/i18n/admin/context';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return TranslationDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const translationInfoLane =
            new ConfiguredWidget("i18n-translation-information-lane", new WidgetConfiguration(
                "i18n-translation-info-widget", "Pattern Information", [], {},
                false, true, null, false)
            );

        const laneTabs = ["i18n-translation-information-lane"];
        const laneTabWidgets = [translationInfoLane];

        // actions
        const generalActions = ['i18n-admin-translation-create'];
        const translationActions = ['i18n-admin-translation-edit'];

        const languagesListWidget =
            new ConfiguredWidget("20190125104012-languages-list", new WidgetConfiguration(
                "i18n-translation-language-list-widget", "Translations", [], null,
                false, true, null, false)
            );

        const content = ['20190125104012-languages-list'];
        const contentWidgets = [languagesListWidget];

        return new ContextConfiguration(
            this.getModuleId(),
            [], [],
            [], [],
            [], [],
            laneTabs, laneTabWidgets,
            content, contentWidgets,
            generalActions, translationActions
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
