import { DataType } from "../../model";

export interface IColumnConfiguration {

    property: string;
    showText: boolean;
    showIcon: boolean;
    dataType: DataType;
    showColumnTitle: boolean;
    showColumnIcon: boolean;
    size: number;
    sortable: boolean;
    filterable: boolean;
    hasListFilter: boolean;
    resizable: boolean;
    componentId: string;
    defaultText: string;

}
