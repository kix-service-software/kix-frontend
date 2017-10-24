import { WidgetComponentState } from '@kix/core/dist/model/client';

export class NotesComponentState extends WidgetComponentState {

    public editMode: boolean;

    public constructor() {
        super();
        this.editMode = false;
    }
}
