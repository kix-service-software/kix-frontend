import { NotesSidebar } from './NotesSidebar';
import { IWidgetFactoryExtension, IWidget } from '@kix/core';

export class NotesSidebarFactoryExtension implements IWidgetFactoryExtension {

    public createWidget(): IWidget {
        return new NotesSidebar(this.getWidgetId());
    }

    public getWidgetId(): string {
        return "notes-sidebar";
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/widgets/notes/';
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
