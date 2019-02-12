import { AbstractTableLayer, TableRow, TableValue } from "../..";
import {
    Customer, KIXObjectType, ContextMode, KIXObject,
    FilterCriteria, KIXObjectLoadingOptions
} from "../../../model";
import { KIXObjectService } from "../../kix";

export class CustomerTableContentLayer extends AbstractTableLayer {

    private customers: Customer[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        private preloadedCustomers: Customer[] = null,
        public filter: FilterCriteria[] = null,
        public sortOrder: string = null,
        private limit: number = 0
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(customers: T[]): void {
        this.preloadedCustomers = (customers as any);
    }

    public async getRows(reload: boolean = false): Promise<any[]> {
        let loadedCustomers = this.customers;
        if (this.preloadedCustomers) {
            loadedCustomers = this.preloadedCustomers;
        } else if (!this.dataLoaded || reload) {
            await this.loadCustomers();
            loadedCustomers = this.customers;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const o of loadedCustomers) {
            const values = columns.map((c) => new TableValue(c.id, o[c.id], '', [], null));
            rows.push(new TableRow(o, values, []));
        }

        return rows;
    }

    private async loadCustomers(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, this.filter, this.sortOrder, null, this.limit, null
        );
        this.customers = await KIXObjectService.loadObjects<Customer>(
            KIXObjectType.CUSTOMER, null, loadingOptions, null, false
        );
        this.dataLoaded = true;
    }

}
