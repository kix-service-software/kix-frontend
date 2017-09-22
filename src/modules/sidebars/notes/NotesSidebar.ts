import { ISidebar } from '@kix/core';

export class NotesSidebar implements ISidebar {

    public id: string;
    public template: string = "sidebars/notes";
    public configurationTemplate: string = "sidebars/notes/configuration";
    public title: string = "Notes (Notizen)";
    public icon: string = 'dummy';
    public isExternal: boolean = false;

    public constructor(id: string) {
        this.id = id;
    }
}
