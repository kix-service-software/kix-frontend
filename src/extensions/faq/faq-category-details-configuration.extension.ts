import { IConfigurationExtension } from "../../core/extensions";
import { FAQCategoryDetailsContext } from "../../core/browser/faq/admin";
import { ContextConfiguration, ConfiguredWidget, WidgetConfiguration, TabWidgetSettings } from "../../core/model";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQCategoryDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('faq-category-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['faq-category-info-widget']))
        );

        const faqInfoLaneTab =
            new ConfiguredWidget('faq-category-info-widget',
                new WidgetConfiguration(
                    'faq-category-info-widget', 'Translatable#FAQ Category Information',
                    [], {}, false, true, null, false
                )
            );

        const actions = ['faq-admin-category-create-action'];
        const faqActions = ['faq-admin-category-edit-action'];

        return new ContextConfiguration(
            this.getModuleId(),
            [], [],
            [], [],
            ['faq-category-details-tab-widget'], [tabLane, faqInfoLaneTab],
            [], [],
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
