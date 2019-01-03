import { AbstractTableLayer, TableRow, TableValue } from "../..";
import {
    KIXObjectType, FilterCriteria, KIXObject, KIXObjectLoadingOptions, Link, LinkObject
} from "../../../model";
import { ContextService } from "../../context";

export class LinkObjectTableContentLayer extends AbstractTableLayer {

    private linkObjects: LinkObject[] = [];

    public constructor(
        private preloadedLinkObjects: LinkObject[] = null,
        public filter: FilterCriteria[] = null,
        public sortOrder: string = null,
        private limit: number = 0
    ) {
        super();
    }

    public setPreloadedObjects<T extends KIXObject>(linkObjects: T[]): void {
        this.preloadedLinkObjects = (linkObjects as any);
    }

    public async getRows(): Promise<any[]> {
        let linkObjects = this.linkObjects;
        if (this.preloadedLinkObjects) {
            linkObjects = this.preloadedLinkObjects;
        }

        const columns = await this.getColumns();
        const rows = [];
        for (const o of linkObjects) {
            const values = columns.map((c) => new TableValue(c.id, o[c.id], '', [], null));
            rows.push(new TableRow(o, values, []));
        }
        return rows;
    }

}
