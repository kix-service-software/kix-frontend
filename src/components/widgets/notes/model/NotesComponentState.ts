import { WidgetComponentState } from '@kix/core/dist/browser/model';
import { NotesSettings } from './NotesSettings';

export class NotesComponentState extends WidgetComponentState<NotesSettings> {

    public editMode: boolean;

    public constructor() {
        super();
        this.editMode = false;
    }
}
