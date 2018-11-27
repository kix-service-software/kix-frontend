import { IConfigurationExtension } from "@kix/core/dist/extensions";
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration,
    WidgetSize, KIXObjectType
} from "@kix/core/dist/model";
import { FAQDetailsContextConfiguration, FAQDetailsContext } from "@kix/core/dist/browser/faq";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {
        // Content Widgets
        const faqDetailsWidget = new ConfiguredWidget("faq-details", new WidgetConfiguration(
            "faq-details-widget", "FAQ Details", [], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        const faqInfoLaneTab =
            new ConfiguredWidget('faq-article-info-lane',
                new WidgetConfiguration(
                    'faq-article-info-widget', 'FAQ Informationen',
                    ['faq-article-edit-action', 'faq-article-print-action'],
                    {}, false, true, WidgetSize.LARGE, null, false
                )
            );
        const faqLinkedObjectsLane =
            new ConfiguredWidget('faq-article-linked-objects-widget',
                new WidgetConfiguration(
                    'linked-objects-widget', 'Verknüpfte Objekte',
                    ['linked-objects-edit-action', 'faq-article-print-action'],
                    {
                        linkedObjectTypes: [
                            ["Tickets", KIXObjectType.TICKET],
                            ["FAQ", KIXObjectType.FAQ_ARTICLE],
                            ["Config Items", KIXObjectType.CONFIG_ITEM]
                        ]
                    },
                    true, true, WidgetSize.LARGE, null, false
                )
            );

        const faqHistoryLane =
            new ConfiguredWidget('faq-article-history-widget',
                new WidgetConfiguration(
                    'faq-article-history-widget', 'Historie', ['faq-article-print-action'], {},
                    true, true, WidgetSize.LARGE, null, false
                )
            );

        const faqArticleWidget =
            new ConfiguredWidget('20181017-faq-article-content-widget',
                new WidgetConfiguration(
                    'faq-article-content-widget', 'FAQ Artikel',
                    ['faq-article-vote-action', 'faq-article-edit-action', 'faq-article-print-action'],
                    {},
                    false, true, WidgetSize.LARGE, null, false
                )
            );

        const laneTabs = ['faq-article-info-lane'];
        const laneTabWidgets = [faqInfoLaneTab];

        const lanes = ['faq-article-linked-objects-widget', 'faq-article-history-widget'];
        const laneWidgets: Array<ConfiguredWidget<any>> = [
            faqDetailsWidget, faqLinkedObjectsLane, faqHistoryLane
        ];

        const actions = ['faq-article-create-action'];
        const faqActions = [
            'linked-objects-edit-action', 'faq-article-delete-action',
            'faq-article-print-action', 'faq-article-edit-action'
        ];

        return new FAQDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], lanes, laneTabs, laneWidgets, laneTabWidgets, actions, faqActions,
            ['20181017-faq-article-content-widget'], [faqArticleWidget]
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
