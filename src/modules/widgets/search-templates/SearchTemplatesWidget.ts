import { IWidget } from './../../../model/client/components/widget/IWidget';

export class SearchTemplatesWidget implements IWidget {

    public id: string = "statistics-widget";

    public template: string = "widgets/statistics";

    public title: string = "Statistik";

    public isExternal: boolean = false;

}
