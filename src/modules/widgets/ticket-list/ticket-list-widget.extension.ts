import { TicketListWidget } from './TicketListWidget';
import { IWidget } from './../../../model/client/components/widget/IWidget';
import { IWidgetFactoryExtension } from './../../../extensions/IWidgetExtension';

export class TicketlistWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new TicketListWidget();
    }

    public getWidgetId(): string {
        return "ticket-list-widget";
    }

}

module.exports = (data, host, options) => {
    return new TicketlistWidgetFactoryExtension();
};
