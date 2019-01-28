import { IConfigurationExtension } from '../../core/extensions';
import {
    WidgetConfiguration, ContextConfiguration, ConfiguredWidget, WidgetSize, TranslationLanguageProperty,
} from '../../core/model/';
import {
    TableColumnConfiguration, TableConfiguration, TableHeaderHeight, TableRowHeight
} from '../../core/browser';
import {
    TranslationDetailsContextConfiguration, TranslationDetailsContext
} from '../../core/browser/i18n/admin/context';

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return TranslationDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        const translationInfoLane =
            new ConfiguredWidget("i18n-translation-information-lane", new WidgetConfiguration(
                "i18n-translation-info-widget", "Basiszeichenketten Informationen", [], {},
                false, true, WidgetSize.SMALL, null, false)
            );

        const laneTabs = ["i18n-translation-information-lane"];
        const laneTabWidgets = [translationInfoLane];

        // actions
        const generalActions = ['i18n-admin-translation-create'];
        const translationActions = ['i18n-admin-translation-edit'];

        const languagesListWidget =
            new ConfiguredWidget("20190125104012-languages-list", new WidgetConfiguration(
                "i18n-translation-language-list-widget", "Übersetzungen", [],
                {
                    generalActions: [],
                    tableConfiguration: new TableConfiguration(
                        null, null, [
                            new TableColumnConfiguration(
                                TranslationLanguageProperty.LANGUAGE, true, false, false, true, 60, true, false
                            ),
                            new TableColumnConfiguration(
                                TranslationLanguageProperty.VALUE, true, false, false, true, 60, true, false
                            )
                        ], null, true, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
                    )
                },
                false, true, WidgetSize.LARGE, null, false)
            );

        const content = ['20190125104012-languages-list'];
        const contentWidgets = [languagesListWidget];

        return new TranslationDetailsContextConfiguration(
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
