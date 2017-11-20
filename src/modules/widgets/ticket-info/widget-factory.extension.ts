import { TicketInfoWidget } from './TicketInfoWidget';
import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';
import { IWidget } from '@kix/core/dist/model/widget/IWidget';

export class TicketInfoWidgetFactoryExtension implements IWidgetFactoryExtension {

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
