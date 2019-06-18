import { IdService } from "../../../../core/browser";
import {
    KIXObjectType, WidgetConfiguration, SortOrder, TranslationPatternProperty, TableWidgetSettings
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
            new TableWidgetSettings(KIXObjectType.TRANSLATION_PATTERN,
                [TranslationPatternProperty.VALUE, SortOrder.UP]), false, false, 'kix-icon-gears'
        )
    ) { }

}
