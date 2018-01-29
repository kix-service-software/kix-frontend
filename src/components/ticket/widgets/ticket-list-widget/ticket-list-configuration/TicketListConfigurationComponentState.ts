import { WidgetConfiguration } from '@kix/core/dist/model/';
import { TicketListSettings } from '../model/TicketListSettings';

export class TicketListConfigurationComponentState {

    public constructor(
        public configuration: WidgetConfiguration<TicketListSettings> = null,
        public instanceId: string = null,
        public properties: Array<[string, string]> = []
    ) { }
}
