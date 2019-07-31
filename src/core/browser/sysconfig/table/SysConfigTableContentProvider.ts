/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../table/TableContentProvider";
import {
    KIXObjectType, KIXObjectLoadingOptions, SysConfigOption, SysConfigKey,
    FilterCriteria, SysConfigOptionDefinitionProperty, FilterDataType, FilterType, KIXObject, SysConfigOptionProperty
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
            loadingOptions = new KIXObjectLoadingOptions(definitionFilter);
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

    private createRowObject(definition: SysConfigOptionDefinition): RowObject {
        const values: TableValue[] = [];

        for (const property in definition) {
            if (definition.hasOwnProperty(property)) {
                if (property === SysConfigOptionDefinitionProperty.NAME) {
                    values.push(new TableValue(property, definition[property], definition[property]));
                } else {
                    values.push(new TableValue(property, definition[property]));
                }
            }
        }

        const rowObject = new RowObject<SysConfigOptionDefinition>(values, definition);

        return rowObject;
    }
}
