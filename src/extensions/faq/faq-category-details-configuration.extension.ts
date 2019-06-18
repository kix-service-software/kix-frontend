import { IConfigurationExtension } from "../../core/extensions";
import { FAQCategoryDetailsContext } from "../../core/browser/faq/admin";
import { ContextConfiguration, ConfiguredWidget, WidgetConfiguration, WidgetSize } from "../../core/model";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQCategoryDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

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
            ['faq-category-info-widget'], [faqInfoLaneTab],
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
