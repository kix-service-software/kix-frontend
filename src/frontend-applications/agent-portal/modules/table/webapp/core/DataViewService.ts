import { WidgetType } from '../../../../model/configuration/WidgetType';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { DataView } from '../../model/DataView';

export class DataViewService {

    private static INSTANCE: DataViewService;

    public static getInstance(): DataViewService {
        if (!DataViewService.INSTANCE) {
            DataViewService.INSTANCE = new DataViewService();
        }
        return DataViewService.INSTANCE;
    }

    private constructor() { }

    private dataViews: DataView[] = [];

    public registerDataView(tableView: DataView): void {
        this.dataViews.push(tableView);
    }

    public getDataViews(
        objectType?: KIXObjectType | string, widgetType?: WidgetType | string
    ): DataView[] {
        let views = this.dataViews;

        if (objectType) {
            views = views.filter((dv) => {
                return dv.objectTypes?.length > 0
                    ? dv.objectTypes.some((ot) => ot === objectType)
                    : true;
            });
        }

        if (widgetType) {
            views = views.filter((dv) => {
                return dv.widgetTypes?.length > 0
                    ? dv.widgetTypes.some((wt) => wt === widgetType)
                    : true;
            });
        }

        return views;
    }

}