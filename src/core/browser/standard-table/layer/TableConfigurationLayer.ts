import { AbstractTableLayer } from "./AbstractTableLayer";
import { TableColumnConfiguration, TableColumn } from "..";

export class TableConfigurationLayer extends AbstractTableLayer {

    private configuredColumns: TableColumn[] = [];
    private additionalColumns: TableColumn[] = [];

    public constructor(private columnConfiguration: TableColumnConfiguration[]) {
        super();
        this.configuredColumns = this.columnConfiguration.map(
            (cc) => new TableColumn(
                cc.columnId,
                cc.dataType,
                cc.columnId,
                cc.icon,
                cc.sortable,
                cc.resizable,
                cc.size,
                cc.columnTitle,
                cc.action,
                cc.hasText,
                cc.hasIcon,
                cc.routingConfiguration
            )
        );
    }

    public async getColumns(): Promise<TableColumn[]> {
        return [...this.configuredColumns, ...this.additionalColumns];
    }

    public addColumns(tableColumns: TableColumn[]): void {
        this.additionalColumns = tableColumns.filter(
            (tc) => !this.columnConfiguration.some((cc) => cc.columnId === tc.id)
        );
    }
}
