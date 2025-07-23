import { WidgetType } from '../../../model/configuration/WidgetType';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class DataView {

    public constructor(
        public id: string,
        public name: string,
        public componentId: string,
        public icon: string,
        public objectTypes: Array<KIXObjectType | string> = [KIXObjectType.TICKET],
        public widgetTypes: Array<WidgetType | string> = [WidgetType.CONTENT]
    ) { }
}