import { ITableContentProvider } from "./ITableContentProvider";
import { KIXObjectType, KIXObjectLoadingOptions, KIXObject } from "../../model";
import { ITable } from "./ITable";
import { ContextService } from "../context";
import { IdService } from "../IdService";
import { IRowObject } from "./IRowObject";
import { KIXObjectService } from "../kix";
import { RowObject } from "./RowObject";
import { TableValue } from "./TableValue";

export class TableContentProvider<T extends KIXObject = any> implements ITableContentProvider<T> {

    protected initialized: boolean = false;

    public constructor(
        protected objectType: KIXObjectType,
        protected table: ITable,
        protected objectIds: Array<number | string>,
        protected loadingOptions: KIXObjectLoadingOptions,
        protected contextId?: string
    ) { }

    public async initialize(): Promise<void> {
        if (!this.initialized) {
            if (this.contextId) {
                const context = await ContextService.getInstance().getContext(this.contextId);
                if (context) {
                    context.registerListener(this.table.getTableId() + '-content-provider', {
                        explorerBarToggled: () => { return; },
                        filteredObjectListChanged: () => { return; },
                        objectChanged: this.objectListChanged.bind(this),
                        objectListChanged: this.objectListChanged.bind(this),
                        sidebarToggled: () => { return; },
                        scrollInformationChanged: () => { return; }
                    });
                    this.initialized = true;
                }
            }
        }
    }

    public async destroy(): Promise<void> {
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            if (context) {
                context.unregisterListener(this.table.getTableId() + '-content-provider');
            }
        }
    }

    private objectListChanged(): void {
        this.table.reload();
    }

    public getObjectType(): KIXObjectType {
        return this.objectType;
    }

    public async loadData(): Promise<Array<IRowObject<T>>> {
        let objects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            objects = context ? await context.getObjectList() : [];
        } else {
            objects = await KIXObjectService.loadObjects<T>(
                this.objectType, this.objectIds, this.loadingOptions, null, false
            );
        }

        const rowObjects = objects.map((t) => {
            const values: TableValue[] = [];

            for (const property in t) {
                if (t.hasOwnProperty(property)) {
                    values.push(new TableValue(property, t[property]));
                }
            }

            return new RowObject<T>(values, t);
        });

        return rowObjects;
    }
}
