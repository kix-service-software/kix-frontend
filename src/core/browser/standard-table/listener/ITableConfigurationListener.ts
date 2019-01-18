import { TableColumn } from "..";

export interface ITableConfigurationListener {

    columnConfigurationChanged(column: TableColumn): void;

}
