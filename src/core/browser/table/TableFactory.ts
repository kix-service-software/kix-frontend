import { ITableFactory } from "./ITableFactory";
import { KIXObjectType, KIXObjectProperty, DataType } from "../../model";
import { IColumnConfiguration } from "./IColumnConfiguration";
import { TableConfiguration } from "./TableConfiguration";
import { ITable } from "./ITable";
import { DefaultColumnConfiguration } from "./DefaultColumnConfiguration";

export abstract class TableFactory implements ITableFactory {

    public abstract objectType: KIXObjectType;

    public isFactoryFor(objectType: KIXObjectType): boolean {
        return objectType === this.objectType;
    }

    public abstract createTable(
        tableKey: string, tableConfiguration?: TableConfiguration, objectids?: Array<string | number>,
        contextId?: string, defaultRouting?: boolean, defaultToggle?: boolean, short?: boolean,
        objectType?: KIXObjectType
    ): ITable;

    public getDefaultColumnConfiguration(property: string): IColumnConfiguration {
        let config;
        switch (property) {
            case KIXObjectProperty.COMMENT:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 350, true, true, false,
                    DataType.STRING, true, undefined, null, false
                );
                break;
            case 'ICON':
                config = new DefaultColumnConfiguration(
                    property, false, true, false, false, 41, false, false, false, undefined, false
                );
                break;
            case KIXObjectProperty.VALID_ID:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true, true);
                break;
            case KIXObjectProperty.CHANGE_TIME:
            case KIXObjectProperty.CREATE_TIME:
                config = new DefaultColumnConfiguration(
                    property, true, false, true, false, 150, true, true, false, DataType.DATE_TIME
                );
                break;
            default:
                config = new DefaultColumnConfiguration(property, true, false, true, false, 150, true, true);
        }
        return config;
    }

}
