import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize } from "@kix/core/dist/model";
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

        const faqInfoLane =
            new ConfiguredWidget('faq-article-info-lane', new WidgetConfiguration(
                'faq-article-info-widget', 'FAQ-Informationen', [], {},
                false, true, WidgetSize.LARGE, null, false)
            );

        const laneWidgets: Array<ConfiguredWidget<any>> = [faqDetailsWidget];

        const laneTabs = ['faq-article-info-lane'];
        const laneTabWidgets = [faqInfoLane];

        const actions = ['faq-article-create-action'];
        const faqActions = [
            'faq-article-link-action', 'faq-article-delete-action',
            'faq-article-print-action', 'faq-article-edit-action'
        ];

        return new FAQDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], [], laneTabs, laneWidgets, laneTabWidgets, actions, faqActions
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
