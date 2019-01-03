import { DataType, ObjectIcon } from "../../../model";
import { RoutingConfiguration } from "../../router";

export class TableColumnConfiguration {

    public constructor(
        public columnId: string,
        public hasText: boolean = true,
        public hasIcon: boolean = false,
        public resizable: boolean = true,
        public sortable: boolean = true,
        public size: number = 50,
        public columnTitle: boolean = true,
        public action: boolean = false,
        public dataType: DataType = DataType.STRING,
        public routingConfiguration?: RoutingConfiguration,
        public icon: string | ObjectIcon = null
    ) { }

}
