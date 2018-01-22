import { IWidget } from '@kix/core/dist/model';
import { IdService } from '@kix/core/dist/browser/IdService';

export class NotesWidget implements IWidget {

    public id: string;

    public instanceId: string = IdService.generateDateBasedId();

    public icon: string = 'note';

    public constructor(id: string) {
        this.id = id;
    }
}
