import { TicketInfoSidebar } from './TicketInfoSidebar';
import { IWidgetFactoryExtension, IWidget } from '@kix/core';

export class NotesSidebarFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new TicketInfoSidebar(this.getWidgetId());
    }

    public getWidgetId(): string {
        return "ticket-info";
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/sidebars/ticket-info';
    }

    public getConfigurationTemplate(): string {
        return this.getTemplate() + '/configuration';
    }

    public getDefaultConfiguration(): any {
        return {};
    }

}

module.exports = (data, host, options) => {
    return new NotesSidebarFactoryExtension();
};
