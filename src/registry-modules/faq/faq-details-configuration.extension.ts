import { IConfigurationExtension } from "../../core/extensions";
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration,
    WidgetSize, KIXObjectType
} from "../../core/model";
import { FAQDetailsContext } from "../../core/browser/faq";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const faqInfoLaneTab =
            new ConfiguredWidget('faq-article-info-lane',
                new WidgetConfiguration(
                    'faq-article-info-widget', 'Translatable#FAQ Information',
                    ['faq-article-edit-action', 'faq-article-print-action'],
                    {}, false, true, WidgetSize.LARGE, null, false
                )
            );
        const faqLinkedObjectsLane =
            new ConfiguredWidget('faq-article-linked-objects-widget',
                new WidgetConfiguration(
                    'linked-objects-widget', 'Translatable#Linked Objects',
                    ['linked-objects-edit-action', 'faq-article-print-action'],
                    {
                        linkedObjectTypes: [
                            ["Tickets", KIXObjectType.TICKET],
                            ["FAQs", KIXObjectType.FAQ_ARTICLE],
                            ["Config Items", KIXObjectType.CONFIG_ITEM]
                        ]
                    },
                    true, true, WidgetSize.LARGE, null, false
                )
            );

        const faqHistoryLane =
            new ConfiguredWidget('faq-article-history-widget',
                new WidgetConfiguration(
                    'faq-article-history-widget', 'Translatable#History', ['faq-article-print-action'], {},
                    true, true, WidgetSize.LARGE, null, false
                )
            );

        const faqArticleWidget =
            new ConfiguredWidget('20181017-faq-article-content-widget',
                new WidgetConfiguration(
                    'faq-article-content-widget', 'Translatable#FAQ Article',
                    ['faq-article-vote-action', 'faq-article-edit-action', 'faq-article-print-action'],
                    {},
                    false, true, WidgetSize.LARGE, null, false
                )
            );

        const actions = ['faq-article-create-action'];
        const faqActions = [
            'linked-objects-edit-action', 'faq-article-delete-action',
            'faq-article-print-action', 'faq-article-edit-action'
        ];

        return new ContextConfiguration(
            this.getModuleId(),
            [], [],
            [], [],
            ['faq-article-linked-objects-widget', 'faq-article-history-widget'],
            [faqLinkedObjectsLane, faqHistoryLane],
            ['faq-article-info-lane'], [faqInfoLaneTab],
            ['20181017-faq-article-content-widget'], [faqArticleWidget],
            actions, faqActions
        );
    }

    public async createFormDefinitions(overwrite: boolean): Promise<void> {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
