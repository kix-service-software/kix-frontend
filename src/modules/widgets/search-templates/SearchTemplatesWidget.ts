import { IWidget } from './../../../model/client/components/widget/IWidget';

export class SearchTemplatesWidget implements IWidget {

    public id: string;

    public template: string = "widgets/search-templates";

    public configurationTemplate: string = "widgets/search-templates/configuration";

    public title: string = "Statistik";

    public isExternal: boolean = false;

    public constructor(id: string) {
        this.id = id;
    }

}
