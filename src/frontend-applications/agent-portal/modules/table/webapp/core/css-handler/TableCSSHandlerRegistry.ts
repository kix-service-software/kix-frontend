/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITableCSSHandler } from './ITableCSSHandler';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';

export class TableCSSHandlerRegistry<T = KIXObject> {

    private static INSTANCE: TableCSSHandlerRegistry;

    public static getInstance(): TableCSSHandlerRegistry {
        if (!TableCSSHandlerRegistry.INSTANCE) {
            TableCSSHandlerRegistry.INSTANCE = new TableCSSHandlerRegistry();
        }
        return TableCSSHandlerRegistry.INSTANCE;
    }

    private constructor() { }

    private commonHandler: ITableCSSHandler[] = [];
    private objectHandler: Map<KIXObjectType | string, Array<ITableCSSHandler<T>>> = new Map();

    public registerCommonCSSHandler(handler: ITableCSSHandler): void {
        this.commonHandler.push(handler);
    }

    public registerObjectCSSHandler(
        objectType: KIXObjectType | string, handler: ITableCSSHandler<T>
    ): void {
        if (!this.objectHandler.has(objectType)) {
            this.objectHandler.set(objectType, []);
        }

        this.objectHandler.get(objectType).push(handler);
    }

    public static getCommonCSSHandler(): ITableCSSHandler[] {
        return this.getInstance().commonHandler;
    }

    public static getObjectCSSHandler(objectType: KIXObjectType | string): Array<ITableCSSHandler> {
        return this.getInstance().objectHandler.get(objectType);
    }

}
