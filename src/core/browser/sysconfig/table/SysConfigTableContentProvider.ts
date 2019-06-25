import { TableContentProvider } from "../../table/TableContentProvider";
import {
    KIXObjectType, KIXObjectLoadingOptions, SysConfigOption, SysConfigKey,
    FilterCriteria, SysConfigOptionDefinitionProperty, FilterDataType, FilterType, KIXObject
} from "../../../model";
import { ITable, IRowObject, TableValue, RowObject } from "../../table";
import { SysConfigOptionDefinition } from "../../../model/kix/sysconfig/SysConfigOptionDefinition";
import { KIXObjectService, SearchOperator, ContextService } from "../..";

export class SysConfigTableContentProvider extends TableContentProvider<SysConfigOptionDefinition> {

    public constructor(
        table: ITable,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<SysConfigOptionDefinition>>> {

        const configLevel = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.CONFIG_LEVEL]
        );

        let loadingOptions;
        if (configLevel && !!configLevel.length) {
            const definitionFilter = [
                new FilterCriteria(
                    SysConfigOptionDefinitionProperty.LEVEL, SearchOperator.GREATER_THAN_OR_EQUAL,
                    FilterDataType.NUMERIC, FilterType.OR, configLevel[0].Value
                ),
                new FilterCriteria(
                    SysConfigOptionDefinitionProperty.LEVEL, SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.OR, null
                ),
            ];
            loadingOptions = new KIXObjectLoadingOptions(null, definitionFilter);
        }

        const sysConfigOptions = await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, null, this.loadingOptions ? this.loadingOptions : loadingOptions
        );

        const rowObjects = [];
        sysConfigOptions.forEach((fc) => {
            rowObjects.push(this.createRowObject(fc));
        });

        return rowObjects;
    }

    private createRowObject(sysConfigOption: SysConfigOptionDefinition): RowObject {
        const values: TableValue[] = [];

        for (const property in sysConfigOption) {
            if (sysConfigOption.hasOwnProperty(property)) {
                values.push(new TableValue(property, sysConfigOption[property]));
            }
        }

        const rowObject = new RowObject<SysConfigOptionDefinition>(values, sysConfigOption);

        return rowObject;
    }
}
