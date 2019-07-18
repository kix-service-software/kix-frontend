/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType, KIXObject } from "../../model";
import { ITableCSSHandler } from "./ITableCSSHandler";

export class TableCSSHandlerRegistry {

    private static INSTANCE: TableCSSHandlerRegistry;

    public static getInstance(): TableCSSHandlerRegistry {
        if (!TableCSSHandlerRegistry.INSTANCE) {
            TableCSSHandlerRegistry.INSTANCE = new TableCSSHandlerRegistry();
        }
        return TableCSSHandlerRegistry.INSTANCE;
    }

    private constructor() { }

    private handler: Map<KIXObjectType, ITableCSSHandler<any>> = new Map();

    public registerCSSHandler<T>(objectType: KIXObjectType, handler: ITableCSSHandler<T>): void {
        if (!this.handler.has(objectType)) {
            this.handler.set(objectType, handler);
        }
    }

    public static getCSSHandler<T>(objectType: KIXObjectType): ITableCSSHandler<T> {
        return TableCSSHandlerRegistry.getInstance().handler.get(objectType);
    }

}
