import { IConfigurationExtension } from "../../core/extensions";
import {
    ContextConfiguration, ConfiguredWidget, WidgetConfiguration,
    KIXObjectType, CRUD, TabWidgetSettings
} from "../../core/model";
import { UIComponentPermission } from "../../core/model/UIComponentPermission";
import { FAQDetailsContext } from "../../core/browser/faq/context/FAQDetailsContext";

export class Extension implements IConfigurationExtension {

    public getModuleId(): string {
        return FAQDetailsContext.CONTEXT_ID;
    }

    public async getDefaultConfiguration(): Promise<ContextConfiguration> {

        const tabLane = new ConfiguredWidget('faq-details-tab-widget',
            new WidgetConfiguration('tab-widget', '', [], new TabWidgetSettings(['faq-article-info-lane']))
        );

        const faqInfoLaneTab =
            new ConfiguredWidget('faq-article-info-lane',
                new WidgetConfiguration(
                    'faq-article-info-widget', 'Translatable#FAQ Information',
                    ['faq-article-edit-action'],
                    {}, false, true, null, false
                )
            );
        const faqLinkedObjectsLane =
            new ConfiguredWidget('faq-article-linked-objects-widget',
                new WidgetConfiguration(
                    'linked-objects-widget', 'Translatable#Linked Objects',
                    ['linked-objects-edit-action'],
                    {
                        linkedObjectTypes: [
                            ["Tickets", KIXObjectType.TICKET],
                            ["FAQs", KIXObjectType.FAQ_ARTICLE],
                            ["Config Items", KIXObjectType.CONFIG_ITEM]
                        ]
                    },
                    true, true, null, false
                ),
                [new UIComponentPermission('links', [CRUD.READ])]
            );

        const faqHistoryLane =
            new ConfiguredWidget('faq-article-history-widget',
                new WidgetConfiguration(
                    'faq-article-history-widget', 'Translatable#History', [], {},
                    true, true, null, false
                ),
                [new UIComponentPermission('faq/articles/*/history', [CRUD.READ])]
            );

        const faqArticleWidget =
            new ConfiguredWidget('20181017-faq-article-content-widget',
                new WidgetConfiguration(
                    'faq-article-content-widget', 'Translatable#FAQ Article',
                    ['faq-article-vote-action', 'faq-article-edit-action'],
                    {},
                    false, true, null, false
                )
            );

        const actions = ['faq-article-create-action'];
        const faqActions = [
            'linked-objects-edit-action', 'faq-article-delete-action', 'faq-article-edit-action', 'print-action'
        ];

        return new ContextConfiguration(
            this.getModuleId(),
            [], [],
            [], [],
            [
                'faq-details-tab-widget',
                'faq-article-linked-objects-widget', 'faq-article-history-widget'
            ],
            [tabLane, faqInfoLaneTab, faqLinkedObjectsLane, faqHistoryLane],
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
