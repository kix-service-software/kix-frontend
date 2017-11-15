import { TicketInfoWidget } from './TicketInfoWidget';
import { IWidgetFactoryExtension, IWidget } from '@kix/core';

export class TicketInfoWidgetFactoryExtension implements IWidgetFactoryExtension {
    isSidebar: boolean = true;
    isContentWidget: boolean = false;

    public createWidget(): IWidget {
        return new TicketInfoWidget(this.getWidgetId());
    }

    public getWidgetId(): string {
        return "ticket-info-widget";
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/widgets/ticket-info';
    }

    public getConfigurationTemplate(): string {
        return this.getTemplate() + '/configuration';
    }

    public getDefaultConfiguration(): any {
        return {};
    }

}

module.exports = (data, host, options) => {
    return new TicketInfoWidgetFactoryExtension();
};
