import { IWidget } from '@kix/core';

export class NotesSidebar implements IWidget {

    public id: string;
    public instanceId: string = Date.now().toString();

    public type: string = 'sidebar';
    public icon: string = 'dummy';

    public constructor(id: string) {
        this.id = id;
    }
}
