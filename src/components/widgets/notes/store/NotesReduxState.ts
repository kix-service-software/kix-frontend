import { NotesSocketListener } from './../socket/NotesSocketListener';
import { NotesSettings } from './../model/NotesSettings';
import { WidgetReduxState } from '@kix/core/dist/model/client';

export class NotesReduxState extends WidgetReduxState {

    public settings: NotesSettings;

    public socketListener: NotesSocketListener;

}
