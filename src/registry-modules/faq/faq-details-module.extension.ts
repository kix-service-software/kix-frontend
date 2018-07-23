import { IModuleFactoryExtension } from "@kix/core/dist/extensions";
import { ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize } from "@kix/core/dist/model";
import { FAQDetailsContextConfiguration, FAQDetailsContext } from "@kix/core/dist/browser/faq";

export class Extension implements IModuleFactoryExtension {

    public getModuleId(): string {
        return FAQDetailsContext.CONTEXT_ID;
    }

    public getDefaultConfiguration(): ContextConfiguration {
        // Content Widgets
        const ticketDetailsWidget = new ConfiguredWidget("20180710-faq-details", new WidgetConfiguration(
            "faq-details-widget", "FAQ Details", [], null,
            false, true, WidgetSize.BOTH, null, false
        ));


        return new FAQDetailsContextConfiguration(
            this.getModuleId(), [], [], [], [], [], [], [], []
        );
    }

    public createFormDefinitions(): void {
        // do nothing
    }

}

module.exports = (data, host, options) => {
    return new Extension();
};
