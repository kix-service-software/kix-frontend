import { IWidgetSelectionSecondList } from './IWidgetSelectionSecondList';
export class WidgetSelectionComponentState {

    public translations: any = {};
    public filter: string = '';
    public firstList: string[] = [];
    public secondList: IWidgetSelectionSecondList[] = [];
    public actions: object[] = [];
    public firstListFixed: boolean = true;
}
