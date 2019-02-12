import { FilterCriteria, KIXObject, ConfigItem } from '../../../../model';
import { TableColumn, TableRow, AbstractTableLayer, TableValue } from '../../../standard-table';

export class ConfigItemVersionTableContentLayer extends AbstractTableLayer {

    private configItemVersions: ConfigItem[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedConfigItemVersions: ConfigItem[] = null,
        public filter: FilterCriteria[] = null,
        public sortOrder: string = null,
        private limit: number = 0
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(configItemVersions: T[]): void {
        this.preLoadedConfigItemVersions = (configItemVersions as any);
    }

    public async getRows(reload: boolean = false): Promise<any[]> {
        let loadedConfigItems = this.configItemVersions;
        if (this.preLoadedConfigItemVersions) {
            loadedConfigItems = this.preLoadedConfigItemVersions;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const t of loadedConfigItems) {
            const values = columns.map((c) => new TableValue(c.id, t[c.id], '', [], null));
            rows.push(new TableRow(t, values, []));
        }

        return rows;
    }

}
