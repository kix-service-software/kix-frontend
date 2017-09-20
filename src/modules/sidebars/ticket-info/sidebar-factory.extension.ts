import { TicketInfoSidebar } from './TicketInfoSidebar';
import { ISidebarFactoryExtension, ISidebar } from '@kix/core';

export class NotesSidebarFactoryExtension implements ISidebarFactoryExtension {

    public createSidebar(): ISidebar {
        return new TicketInfoSidebar(this.getSidebarId());
    }

    public getSidebarId(): string {
        return "ticket-info";
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/sidebars/ticket-info';
    }

    public getDefaultConfiguration(): any {
        return {};
    }

}

module.exports = (data, host, options) => {
    return new NotesSidebarFactoryExtension();
};
