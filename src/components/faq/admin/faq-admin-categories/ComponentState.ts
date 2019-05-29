import { IdService } from "../../../../core/browser";
import { WidgetConfiguration, TableWidgetSettings, KIXObjectType, SortOrder } from "../../../../core/model";
import { FAQCategoryProperty } from "../../../../core/model/kix/faq";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('faq-admin-categories'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Knowledge Database: FAQ Categories',
            ['faq-admin-category-create-action', 'faq-category-csv-export-action'],
            new TableWidgetSettings(KIXObjectType.FAQ_CATEGORY, [FAQCategoryProperty.NAME, SortOrder.UP]),
            false, false, null, 'kix-icon-gears'
        )
    ) { }

}
