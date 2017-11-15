import { IWidget, IWidgetFactoryExtension, WidgetConfiguration } from '@kix/core';

import { TicketListWidget } from './TicketListWidget';

export class TicketlistWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebar: boolean = false;
    public isContentWidget: boolean = true;
    public widgetId: string = "ticket-list-widget";

    public createWidget(): IWidget {
        return new TicketListWidget(this.widgetId);
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/widgets/ticket-list';
    }

    public getConfigurationTemplate(): string {
        return this.getTemplate() + '/configuration';
    }

    public getDefaultConfiguration(): any {
        const config = {
            limit: 10,
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

        return new WidgetConfiguration('Ticket-Liste', [], config);
    }

}

module.exports = (data, host, options) => {
    return new TicketlistWidgetFactoryExtension();
};
