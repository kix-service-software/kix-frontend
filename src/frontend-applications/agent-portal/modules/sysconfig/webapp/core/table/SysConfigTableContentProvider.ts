/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../../../base-components/webapp/core/table/TableContentProvider";
import { SysConfigOptionDefinition } from "../../../model/SysConfigOptionDefinition";
import { ITable, IRowObject, RowObject, TableValue } from "../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { SysConfigOption } from "../../../model/SysConfigOption";
import { SysConfigKey } from "../../../model/SysConfigKey";
import { FilterCriteria } from "../../../../../model/FilterCriteria";
import { SysConfigOptionDefinitionProperty } from "../../../model/SysConfigOptionDefinitionProperty";
import { SearchOperator } from "../../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../../model/FilterDataType";
import { FilterType } from "../../../../../model/FilterType";
import { AdminContext } from "../../../../admin/webapp/core";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";

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

        let loadingOptions: KIXObjectLoadingOptions;
        if (configLevel && !!configLevel.length) {
            const definitionFilter = [
                new FilterCriteria(
                    SysConfigOptionDefinitionProperty.EXPERIENCE_LEVEL, SearchOperator.GREATER_THAN_OR_EQUAL,
                    FilterDataType.NUMERIC, FilterType.OR, Number(configLevel[0].Value)
                ),
                new FilterCriteria(
                    SysConfigOptionDefinitionProperty.EXPERIENCE_LEVEL, SearchOperator.EQUALS,
                    FilterDataType.NUMERIC, FilterType.OR, null
                ),
            ];
            loadingOptions = new KIXObjectLoadingOptions(definitionFilter);
        }

        const sysConfigDefinitions = await KIXObjectService.loadObjects<SysConfigOptionDefinition>(
            KIXObjectType.SYS_CONFIG_OPTION_DEFINITION, null, this.loadingOptions ? this.loadingOptions : loadingOptions
        );

        const rowObjects = [];
        sysConfigDefinitions
            .filter((scd) => scd.Name !== AdminContext.CONTEXT_ID && scd.Name !== 'admin-dashboard-category-explorer')
            .forEach((scd) => {
                rowObjects.push(this.createRowObject(scd));
            });

        return rowObjects;
    }

    private createRowObject(definition: SysConfigOptionDefinition): RowObject {
        const values: TableValue[] = [];

        for (const property in definition) {
            if (definition.hasOwnProperty(property)) {
                if (
                    property === SysConfigOptionDefinitionProperty.NAME ||
                    property === SysConfigOptionDefinitionProperty.CONTEXT ||
                    property === SysConfigOptionDefinitionProperty.CONTEXT_METADATA
                ) {
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
