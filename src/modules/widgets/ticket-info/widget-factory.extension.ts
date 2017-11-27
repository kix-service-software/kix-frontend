import { TicketInfoWidget } from './TicketInfoWidget';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class TicketInfoWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebar: boolean = true;
    public isContentWidget: boolean = false;
    public widgetId: string = "ticket-info-widget";
    public size: WidgetSize = WidgetSize.SMALL;

    public createWidget(): IWidget {
        return new TicketInfoWidget(this.widgetId);
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
        return new WidgetConfiguration('Ticket-Info', [], {}, true, WidgetSize.SMALL);
    }

}

module.exports = (data, host, options) => {
    return new TicketInfoWidgetFactoryExtension();
};
