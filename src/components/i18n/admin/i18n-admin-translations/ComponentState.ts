import { IdService, TableConfiguration, TableHeaderHeight, TableRowHeight } from "../../../../core/browser";
import {
    KIXObjectType, WidgetConfiguration, SortOrder, TranslationPatternProperty,
    TableWidgetSettings, KIXObjectLoadingOptions
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
            new TableWidgetSettings(
                KIXObjectType.TRANSLATION_PATTERN,
                [TranslationPatternProperty.VALUE, SortOrder.UP],
                new TableConfiguration(
                    KIXObjectType.TRANSLATION_PATTERN,
                    new KIXObjectLoadingOptions(null, null, null, [TranslationPatternProperty.AVAILABLE_LANGUAGES]),
                    null, null, true, false, null, null, TableHeaderHeight.LARGE, TableRowHeight.LARGE
                )
            ),
            false, false, 'kix-icon-gears'
        )
    ) { }

}
