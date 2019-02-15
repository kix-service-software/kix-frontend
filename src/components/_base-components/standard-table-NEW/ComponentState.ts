import { ITable, IRow, IColumn } from "../../../core/browser/table";

export class ComponentState {

    public table: ITable = null;
    public rows: IRow[] = [];
    public columns: IColumn[] = [];
    public loading: boolean = true;
    public tableHeight: string = 'unset';

}
