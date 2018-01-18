import { WidgetConfiguration } from '@kix/core/dist/model/';

export class TicketListConfigurationComponentState {

    public constructor(
        public configuration: WidgetConfiguration = null,
        public instanceId: string = null,
        public properties: Array<[string, string]> = []
    ) { }
}
