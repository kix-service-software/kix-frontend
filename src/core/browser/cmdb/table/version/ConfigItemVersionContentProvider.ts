/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IRowObject, RowObject, ITable, TableValue } from "../../../table";
import { KIXObjectType, KIXObjectLoadingOptions, ConfigItem, Version, VersionProperty } from "../../../../model";
import { ContextService } from "../../../context";
import { TableContentProvider } from "../../../table/TableContentProvider";

export class ConfigItemVersionContentProvider extends TableContentProvider<Version> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM_VERSION, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<Version>>> {
        let rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const configItem = await context.getObject<ConfigItem>();
            if (configItem) {
                rowObjects = configItem.Versions
                    .sort((a, b) => b.VersionID - a.VersionID)
                    .map((v, i) => {
                        const values: TableValue[] = [];

                        for (const property in v) {
                            if (v.hasOwnProperty(property)) {
                                values.push(new TableValue(property, v[property]));
                            }
                        }

                        const versionNumber = (configItem.Versions.length - i).toString();
                        values.push(new TableValue(VersionProperty.COUNT_NUMBER, versionNumber, versionNumber));
                        values.push(new TableValue(VersionProperty.CURRENT, v.isCurrentVersion));
                        return new RowObject<Version>(values, v);
                    });
            }
        }

        return rowObjects;
    }
}
