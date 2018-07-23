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

        const laneWidgets: Array<ConfiguredWidget<any>> = [faqDetailsWidget];

        const actions = ['faq-article-create-action'];
        const faqActions = [
            'faq-article-link-action', 'faq-article-delete-action',
            'faq-article-print-action', 'faq-article-edit-action'
        ];

        return new FAQDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], [], [], laneWidgets, [], actions, faqActions
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
