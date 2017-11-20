import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';

import { TicketListWidget } from './TicketListWidget';
import { IWidget, WidgetConfiguration } from '@kix/core/dist/model';

export class TicketlistWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new TicketListWidget(this.getWidgetId());
    }

    public getWidgetId(): string {
        return "ticket-list-widget";
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
