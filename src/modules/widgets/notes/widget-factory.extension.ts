import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';

import { NotesSettings } from './../../../components/widgets/notes/model/NotesSettings';
import { NotesWidget } from './NotesSidebar';
import { IWidget, WidgetConfiguration } from '@kix/core/dist/model';

export class NotesWidgetFactoryExtension implements IWidgetFactoryExtension {
    public isSidebar: boolean = true;
    public isContentWidget: boolean = false;
    public widgetId: string = "notes-widget";

    public createWidget(): IWidget {
        return new NotesWidget(this.widgetId);
    }

    public getTemplate(): string {
        const packageJson = require('../../../../package.json');
        const version = packageJson.version;
        return '/@kix/frontend$' + version + '/dist/components/widgets/notes';
    }

    public getConfigurationTemplate(): string {
        return this.getTemplate() + '/configuration';
    }

    public getDefaultConfiguration(): WidgetConfiguration {
        return new WidgetConfiguration("Notes", [], new NotesSettings());
    }

}

module.exports = (data, host, options) => {
    return new NotesWidgetFactoryExtension();
};
