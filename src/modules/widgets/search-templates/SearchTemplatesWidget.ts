import { IWidget } from './../../../model/client/components/widget/IWidget';

export class SearchTemplatesWidget implements IWidget {

    public id: string = "search-templates-widget";

    public template: string = "widgets/search-templates";

    public configurationTemplate: string = "widgets/search-templates/configuration";

    public title: string = "Statistik";

    public isExternal: boolean = false;

}
