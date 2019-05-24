import {
    WidgetConfiguration, KIXObjectType, TableWidgetSettings, SortOrder, MailAccountProperty
} from "../../../../core/model";
import { IdService } from "../../../../core/browser";

export class ComponentState {
    public constructor(
        public instanceId: string = IdService.generateDateBasedId('communication-mail-accounts-list'),
        public widgetConfiguration: WidgetConfiguration = new WidgetConfiguration(
            'table-widget', 'Translatable#Communication: Email: Email Accounts',
            ['mail-account-create'],
            new TableWidgetSettings(KIXObjectType.MAIL_ACCOUNT,
                [MailAccountProperty.HOST, SortOrder.UP]), false, false, null, 'kix-icon-gears')
    ) { }

}
