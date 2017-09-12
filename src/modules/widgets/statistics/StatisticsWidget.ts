import { IWidget } from './../../../model/client/components/widget/IWidget';

export class StatisticWidget implements IWidget {

    public id: string = "statistics-widget";

    public template: string = "widgets/statistics";

    public configurationTemplate: string = "widgets/statistics/configuration";

    public title: string = "Statistik";

    public isExternal: boolean = false;

}
