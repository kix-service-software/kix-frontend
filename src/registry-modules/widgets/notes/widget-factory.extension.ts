import { IWidgetFactoryExtension } from '@kix/core/dist/extensions';

import { NotesSettings } from './../../../components/widgets/notes/model/NotesSettings';
import { NotesWidget } from './NotesSidebar';
import { WidgetType, IWidget, WidgetConfiguration, WidgetSize } from '@kix/core/dist/model';

export class NotesWidgetFactoryExtension implements IWidgetFactoryExtension {

    public widgetId: string = "notes-widget";

    public type: WidgetType = WidgetType.SIDEBAR;

    public createWidget(): IWidget {
        return new NotesWidget(this.widgetId);
    }

    public getDefaultConfiguration(): WidgetConfiguration<NotesSettings> {
        return new WidgetConfiguration(
            this.widgetId, "Notes", [], new NotesSettings(), this.type, false, true, true, WidgetSize.SMALL, 'note'
        );
    }

}

module.exports = (data, host, options) => {
    return new NotesWidgetFactoryExtension();
};
