import { KIXObjectType, KIXObject } from "../../model";
import { ITableCSSHandler } from "./ITableCSSHandler";

export class TableCSSHandlerRegsitry {

    private static INSTANCE: TableCSSHandlerRegsitry;

    public static getInstance(): TableCSSHandlerRegsitry {
        if (!TableCSSHandlerRegsitry.INSTANCE) {
            TableCSSHandlerRegsitry.INSTANCE = new TableCSSHandlerRegsitry();
        }
        return TableCSSHandlerRegsitry.INSTANCE;
    }

    private constructor() { }

    private handler: Map<KIXObjectType, ITableCSSHandler<KIXObject>> = new Map();

    public registerCSSHandler<T extends KIXObject>(objectType: KIXObjectType, handler: ITableCSSHandler<T>): void {
        if (!this.handler.has(objectType)) {
            this.handler.set(objectType, handler);
        }
    }

    public static getCSSHandler<T extends KIXObject>(objectType: KIXObjectType): ITableCSSHandler<T> {
        return TableCSSHandlerRegsitry.getInstance().handler.get(objectType);
    }

}
