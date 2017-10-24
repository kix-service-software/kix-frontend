import { NotesSocketListener } from './../../socket/NotesSocketListener';
import { StateAction } from '@kix/core/dist/model/client';
import { NotesAction } from './NotesAction';

export default (store: any, widgetId: string, instanceId: string) => {
    const payload = new Promise((resolve, reject) => {
        const socketListener = new NotesSocketListener(store, widgetId, instanceId);
        resolve({ socketListener });
    });
    return new StateAction(NotesAction.NOTES_INITIALIZE, payload);
};
