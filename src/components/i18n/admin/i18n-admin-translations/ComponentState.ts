import { IdService } from "../../../../core/browser";
import {
    KIXObjectType, WidgetConfiguration, SortOrder, TranslationProperty, TableWidgetSettings
} from "../../../../core/model";

export class ComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('translation-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Internationalisation: Translations',
            [
                'i18n-admin-translation-create',
                'i18n-admin-translation-import',
                'i18n-admin-translation-csv-export'
            ],
            new TableWidgetSettings(KIXObjectType.TRANSLATION,
                [TranslationProperty.PATTERN, SortOrder.UP]), false, false, null, 'kix-icon-gears')
    ) { }

}
