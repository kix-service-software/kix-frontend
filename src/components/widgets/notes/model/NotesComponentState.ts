import { WidgetComponentState } from '@kix/core/dist/browser/model';

export class NotesComponentState extends WidgetComponentState {

    public editMode: boolean;

    public constructor() {
        super();
        this.editMode = false;
    }
}
