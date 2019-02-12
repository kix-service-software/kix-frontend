import { DataType, ObjectIcon } from "../../model";
import { RoutingConfiguration } from "../router";

export class TableColumn {

    public constructor(
        public id: string,
        public dataType: DataType,
        public text: string,
        public icon: string | ObjectIcon,
        public sortable: boolean,
        public resizable: boolean,
        public size: number,
        public columnTitle: boolean = true,
        public action: boolean = false,
        public showText: boolean,
        public showIcon: boolean,
        public routingConfiguration: RoutingConfiguration
    ) { }

}
