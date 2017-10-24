import { NotesSocketListener } from './../socket/NotesSocketListener';
import { NotesConfiguration } from './../model/NotesConfiguration';
import { WidgetReduxState } from '@kix/core/dist/model/client';

export class NotesReduxState extends WidgetReduxState {

    public configuration: NotesConfiguration;

    public socketListener: NotesSocketListener;

}
