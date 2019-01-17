import { FilterCriteria, KIXObject, ConfigItemClassDefinition } from '../../../../model';
import { TableRow, AbstractTableLayer, TableValue } from '../../../standard-table';

export class ConfigItemClassDefinitionTableContentLayer extends AbstractTableLayer {

    private ciClassDefinitions: ConfigItemClassDefinition[] = [];

    public constructor(
        public preLoadedCIClassDefintions: ConfigItemClassDefinition[] = null,
        public filter: FilterCriteria[] = null,
        public sortOrder: string = null,
        private limit: number = 0
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(ciClassDefinitions: T[]): void {
        this.preLoadedCIClassDefintions = (ciClassDefinitions as any);
    }

    public async getRows(reload: boolean = false): Promise<any[]> {
        let loadedCIClassDefinitions = this.ciClassDefinitions;
        if (this.preLoadedCIClassDefintions) {
            loadedCIClassDefinitions = this.preLoadedCIClassDefintions;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const t of loadedCIClassDefinitions) {
            const values = columns.map((c) => new TableValue(c.id, t[c.id], '', [], null));
            rows.push(new TableRow(t, values, []));
        }

        return rows;
    }

}
