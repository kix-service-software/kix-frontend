import { AbstractTableLayer, TableRow, TableValue } from "../..";
import {
    Contact, KIXObjectType, FilterCriteria, KIXObject, KIXObjectLoadingOptions
} from "../../../model";
import { KIXObjectService } from "../../kix";

export class ContactTableContentLayer extends AbstractTableLayer {

    private contacts: Contact[] = [];

    private dataLoaded: boolean = false;

    public constructor(
        private preloadedContacts: Contact[] = null,
        public filter: FilterCriteria[] = null,
        public sortOrder: string = null,
        private limit: number = 0
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(contacts: T[]): void {
        this.preloadedContacts = (contacts as any);
    }

    public async getRows(reload: boolean = false): Promise<any[]> {
        let loadedContacts = this.contacts;
        if (this.preloadedContacts) {
            loadedContacts = this.preloadedContacts;
        } else if (!this.dataLoaded || reload) {
            await this.loadContacts();
            loadedContacts = this.contacts;
        }

        const columns = await this.getColumns();
        const rows = [];

        for (const o of loadedContacts) {
            const values = columns.map((c) => new TableValue(c.id, o[c.id], '', [], null));
            rows.push(new TableRow(o, values, []));
        }

        return rows;
    }

    private async loadContacts(): Promise<void> {
        const loadingOptions = new KIXObjectLoadingOptions(
            null, this.filter, this.sortOrder, null, this.limit, null
        );
        this.contacts = await KIXObjectService.loadObjects<Contact>(
            KIXObjectType.CONTACT, null, loadingOptions, null, false
        );
        this.dataLoaded = true;
    }

}
