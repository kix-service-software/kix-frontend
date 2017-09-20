import { TicketListWidget } from './TicketListWidget';
import { IWidgetFactoryExtension, IWidget } from '@kix/core';

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

    public getDefaultConfiguration(): any {
        return {};
    }

}

module.exports = (data, host, options) => {
    return new TicketlistWidgetFactoryExtension();
};
