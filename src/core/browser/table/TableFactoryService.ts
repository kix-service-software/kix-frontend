import { ITableFactory } from "./ITableFactory";
import { KIXObjectType, ContextType, Context } from "../../model";
import { ITable } from "../table";
import { TableConfiguration } from "./TableConfiguration";
import { IColumnConfiguration } from "./IColumnConfiguration";
import { ContextService } from "../context";

export class TableFactoryService {

    private static INSTANCE: TableFactoryService;

    public static getInstance(): TableFactoryService {
        if (!TableFactoryService.INSTANCE) {
            TableFactoryService.INSTANCE = new TableFactoryService();
        }

        return TableFactoryService.INSTANCE;
    }

    private constructor() {
        ContextService.getInstance().registerListener({
            contextChanged: this.contextChanged.bind(this)
        });
    }

    private mainContextId = null;
    private dialogContextId = null;

    private contextChanged(
        contextId: string, context: Context, type: ContextType, history: boolean, oldContext: Context
    ): void {
        if (oldContext) {
            if (type === oldContext.getDescriptor().contextType) {
                let switchContext = false;
                if (type === ContextType.MAIN && contextId !== this.mainContextId) {
                    this.mainContextId = contextId;
                    switchContext = true;
                } else if (type === ContextType.DIALOG && contextId !== this.dialogContextId) {
                    this.dialogContextId = contextId;
                    switchContext = true;
                }

                if (switchContext) {
                    const oldContextid = oldContext.getDescriptor().contextId;

                    if (this.contextTableInstances.has(oldContextid)) {
                        this.contextTableInstances.delete(oldContextid);
                    }
                }
            }
        }
    }

    private factories: ITableFactory[] = [];

    private contextTableInstances: Map<string, Map<string, ITable>> = new Map();

    public registerFactory(factory: ITableFactory): void {
        if (this.factories.some((f) => f.isFactoryFor(factory.objectType))) {
            console.warn(`Redudant TableFactory for type ${factory.objectType}`);
        }

        this.factories.push(factory);
    }

    public async createTable(
        tableKey: string, objectType: KIXObjectType, tableConfiguration?: TableConfiguration,
        objectIds?: Array<number | string>, contextId?: string, defaultRouting?: boolean,
        defaultToggle?: boolean, short: boolean = false, reload: boolean = true
    ): Promise<ITable> {
        let table: ITable;

        const context = ContextService.getInstance().getActiveContext();
        let tableContextId: string;
        if (context) {
            tableContextId = context.getDescriptor().contextId;
            if (this.contextTableInstances.has(tableContextId)) {
                const tableInstances = this.contextTableInstances.get(tableContextId);
                if (tableInstances.has(tableKey)) {
                    table = tableInstances.get(tableKey);
                    if (reload) {
                        await table.reload(true);
                    }
                }
            }
        }

        if (!table) {
            const factory = this.factories.find((f) => f.isFactoryFor(objectType));
            if (factory) {
                table = factory.createTable(
                    tableKey, tableConfiguration, objectIds, contextId, defaultRouting, defaultToggle, short, objectType
                );

                if (tableContextId) {
                    if (!this.contextTableInstances.has(tableContextId)) {
                        this.contextTableInstances.set(tableContextId, new Map());
                    }
                    this.contextTableInstances.get(tableContextId).set(tableKey, table);
                }
            }
        }
        return table;
    }

    public getDefaultColumnConfiguration(objectType: KIXObjectType, property: string): IColumnConfiguration {
        const factory = this.factories.find((f) => f.objectType === objectType);
        return factory ? factory.getDefaultColumnConfiguration(property) : null;
    }
}
