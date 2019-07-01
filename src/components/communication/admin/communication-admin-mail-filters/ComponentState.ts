import {
    WidgetConfiguration, KIXObjectType, TableWidgetSettings, SortOrder, MailFilterProperty
} from "../../../../core/model";
import { IdService } from "../../../../core/browser";

export class ComponentState {
    public constructor(
        public instanceId: string = IdService.generateDateBasedId('communication-mail-filter-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Communication: Email: Email Filters',
            ['mail-filter-create', 'csv-export-action'],
            new TableWidgetSettings(KIXObjectType.MAIL_FILTER,
                [MailFilterProperty.NAME, SortOrder.UP]), false, false, 'kix-icon-gears')
    ) { }

}
