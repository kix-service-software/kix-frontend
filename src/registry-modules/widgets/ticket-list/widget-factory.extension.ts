import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';

import { TicketListWidget } from './TicketListWidget';
import { IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class TicketlistWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebarWidget: boolean = false;
    public isContentWidget: boolean = true;
    public isExplorerWidget: boolean = false;
    public widgetId: string = "ticket-list-widget";

    public createWidget(): IWidget {
        return new TicketListWidget(this.widgetId);
    }

    public getDefaultConfiguration(): any {
        const settings = {
            limit: 10,
            displayLimit: 10,
            showTotalCount: true,
            properties: [
                "TicketNumber",
                "PriorityID",
                "StateID",
                "TypeID",
                "Title",
                "Created",
                "Age"
            ]
        };

        return new WidgetConfiguration(this.widgetId, 'Ticket-Liste', [], settings, true, WidgetSize.LARGE);
    }

}

module.exports = (data, host, options) => {
    return new TicketlistWidgetFactoryExtension();
};
