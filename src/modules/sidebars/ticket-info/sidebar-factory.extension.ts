import { TicketInfoSidebar } from './TicketInfoSidebar';
import { ISidebar } from './../../../model/client/components/';
import { ISidebarFactoryExtension } from './../../../extensions/ISidebarFactoryExtension';

export class NotesSidebarFactoryExtension implements ISidebarFactoryExtension {

    public createSidebar(): ISidebar {
        return new TicketInfoSidebar(this.getSidebarId());
    }

    public getSidebarId(): string {
        return "ticket-info";
    }

    public getDefaultConfiguration(): any {
        return {};
    }

}

module.exports = (data, host, options) => {
    return new NotesSidebarFactoryExtension();
};
