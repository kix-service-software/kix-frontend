import { NotesSidebar } from './NotesSidebar';
import { ISidebar } from './../../../model/client/components/';
import { ISidebarFactoryExtension } from './../../../extensions/ISidebarFactoryExtension';

export class NotesSidebarFactoryExtension implements ISidebarFactoryExtension {

    public createSidebar(): ISidebar {
        return new NotesSidebar(this.getSidebarId());
    }

    public getSidebarId(): string {
        return "notes-sidebar";
    }

    public getDefaultConfiguration(): any {
        return {};
    }

}

module.exports = (data, host, options) => {
    return new NotesSidebarFactoryExtension();
};
