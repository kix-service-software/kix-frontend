import { IWidget } from '@kix/core';

export class SearchTemplatesWidget implements IWidget {

    public id: string;

    public template: string = null;

    public configurationTemplate: string = "widgets/search-templates/configuration";

    public title: string = "Statistik";

    public isExternal: boolean = false;

    public constructor(id: string) {
        this.id = id;
    }

}
