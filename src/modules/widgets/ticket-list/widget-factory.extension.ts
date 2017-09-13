import { TicketListWidget } from './TicketListWidget';
import { IWidget } from './../../../model/client/components/widget/IWidget';
import { IWidgetFactoryExtension } from './../../../extensions/IWidgetFactoryExtension';

export class TicketlistWidgetFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new TicketListWidget(this.getWidgetId());
    }

    public getWidgetId(): string {
        return "ticket-list-widget";
    }

    public getDefaultConfiguration(): any {
        return {};
    }

}

module.exports = (data, host, options) => {
    return new TicketlistWidgetFactoryExtension();
};
