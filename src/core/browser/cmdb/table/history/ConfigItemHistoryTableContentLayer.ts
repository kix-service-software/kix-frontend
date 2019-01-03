import { TableRow, AbstractTableLayer, TableColumn, TableValue } from '../../../standard-table';
import { ConfigItemHistory, SortUtil, DataType, ConfigItem } from '../../../../model';

export class ConfigItemHistoryTableContentLayer extends AbstractTableLayer {

    private configItemHistory: ConfigItemHistory[] = [];

    private dataLoaded: boolean = false;

    public constructor(private configItem: ConfigItem) {
        super();
    }

    public async getRows(): Promise<Array<TableRow<ConfigItemHistory>>> {
        if (!this.dataLoaded) {
            this.loadConfigItemHistory();
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const o of this.configItemHistory) {
            const values = columns.map((c) => new TableValue(c.id, o[c.id], '', [], null));
            rows.push(new TableRow(o, values, []));
        }

        return rows;
    }

    private loadConfigItemHistory(): void {
        if (this.configItem) {
            this.configItemHistory = this.configItem.History.sort(
                (a: ConfigItemHistory, b: ConfigItemHistory) =>
                    SortUtil.compareObjects(a, b, 'CreateTime', DataType.DATE_TIME)
            );

            this.dataLoaded = true;
        }
    }
}
