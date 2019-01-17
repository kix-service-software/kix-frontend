import {
    KIXObjectType, FilterCriteria,
    KIXObject, KIXObjectLoadingOptions, ConfigItem
} from '../../../model';
import { TableColumn, TableRow, AbstractTableLayer, TableValue } from '../../standard-table';
import { KIXObjectService } from '../../kix';

export class ConfigItemTableContentLayer extends AbstractTableLayer {

    private configItems: ConfigItem[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        public preLoadedConfigItems: ConfigItem[] = null,
        public filter: FilterCriteria[] = null,
        public sortOrder: string = null,
        private limit: number = 0
    ) {
        super();
    }

    public async getColumns(): Promise<TableColumn[]> {
        return await this.getPreviousLayer().getColumns();
    }

    public setPreloadedObjects<T extends KIXObject>(configItems: T[]): void {
        this.preLoadedConfigItems = (configItems as any);
    }

    public async getRows(reload: boolean = false): Promise<TableRow[]> {
        let loadedConfigItems = this.configItems;
        if (this.preLoadedConfigItems) {
            loadedConfigItems = this.preLoadedConfigItems;
        } else if (!this.dataLoaded || reload) {
            await this.loadConfigItems();
            loadedConfigItems = this.configItems;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const t of loadedConfigItems) {
            const values = columns.map((c) => new TableValue(c.id, t[c.id], '', [], null));
            rows.push(new TableRow(t, values, []));
        }

        return rows;
    }

    private async loadConfigItems(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, this.filter, this.sortOrder, null, this.limit
        );
        this.configItems = await KIXObjectService.loadObjects<ConfigItem>(
            KIXObjectType.CONFIG_ITEM, null, loadingOptions, null, false
        );
        this.dataLoaded = true;
    }
}
