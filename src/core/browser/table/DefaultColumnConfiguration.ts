import { IColumnConfiguration } from "./IColumnConfiguration";
import { DataType } from "../../model";

export class DefaultColumnConfiguration implements IColumnConfiguration {

    public constructor(
        public property: string,
        public showText: boolean = true,
        public showIcon: boolean = true,
        public showColumnTitle: boolean = true,
        public showColumnIcon: boolean = false,
        public size: number = 100,
        public sortable: boolean = true,
        public filterable: boolean = false,
        public hasListFilter: boolean = false,
        public dataType: DataType = DataType.STRING,
        public resizable: boolean = true,
        public componentId: string = null,
        public defaultText: string = null
    ) {
    }
}
