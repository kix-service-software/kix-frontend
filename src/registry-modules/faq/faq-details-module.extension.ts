import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration,
    WidgetSize, KIXObjectType
} from "@kix/core/dist/model";
import { FAQDetailsContextConfiguration, FAQDetailsContext } from "@kix/core/dist/browser/faq";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return FAQDetailsContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        // Content Widgets
        const faqDetailsWidget = new ConfiguredWidget("faq-details", new WidgetConfiguration(
            "faq-details-widget", "FAQ Details", [], null,
            false, true, WidgetSize.BOTH, null, false
        ));

        const faqInfoLaneTab =
            new ConfiguredWidget('faq-article-info-lane',
                new WidgetConfiguration(
                    'faq-article-info-widget', 'FAQ-Informationen',
                    ['faq-article-edit-action', 'faq-article-print-action'],
                    {}, false, true, WidgetSize.LARGE, null, false
                )
            );
        const faqLinkedObjectsLane =
            new ConfiguredWidget('faq-article-linked-objects-widget',
                new WidgetConfiguration(
                    'faq-article-linked-objects-widget', 'Verknüpfte Objekte',
                    ['faq-article-edit-action', 'faq-article-print-action'],
                    {
                        linkedObjectTypes: [
                            ["Tickets", KIXObjectType.TICKET],
                            ["FAQs", KIXObjectType.FAQ_ARTICLE]
                        ]
                    },
                    false, true, WidgetSize.LARGE, null, false
                )
            );

        const laneTabs = ['faq-article-info-lane'];
        const laneTabWidgets = [faqInfoLaneTab];

        const lanes = ['faq-article-linked-objects-widget'];
        const laneWidgets: Array<ConfiguredWidget<any>> = [faqDetailsWidget, faqLinkedObjectsLane];

        const actions = ['faq-article-create-action'];
        const faqActions = [
            'faq-article-link-action', 'faq-article-delete-action',
            'faq-article-print-action', 'faq-article-edit-action'
        ];

        return new FAQDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], lanes, laneTabs, laneWidgets, laneTabWidgets, actions, faqActions
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
