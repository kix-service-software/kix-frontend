/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from "../../../../../base-components/webapp/core/table/TableContentProvider";
import { Version } from "../../../../model/Version";
import { ITable, IRowObject, TableValue, RowObject } from "../../../../../base-components/webapp/core/table";
import { KIXObjectLoadingOptions } from "../../../../../../model/KIXObjectLoadingOptions";
import { KIXObjectType } from "../../../../../../model/kix/KIXObjectType";
import { ContextService } from "../../../../../../modules/base-components/webapp/core/ContextService";
import { ConfigItem } from "../../../../model/ConfigItem";
import { TranslationService } from "../../../../../../modules/translation/webapp/core/TranslationService";
import { DateTimeUtil } from "../../../../../../modules/base-components/webapp/core/DateTimeUtil";
import { VersionProperty } from "../../../../model/VersionProperty";

export class ConfigItemVersionContentProvider extends TableContentProvider<Version> {

    public constructor(
        table: ITable,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<IRowObject<Version>>> {
        const rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const configItem = await context.getObject<ConfigItem>();
            if (configItem) {
                const translatedCurrentVersion = await TranslationService.translate('Translatable#current');
                const translatedCreated = await TranslationService.translate('Translatable#created');
                const translatedVersion = await TranslationService.translate('Translatable#Version');

                configItem.Versions.sort((a, b) => b.VersionID - a.VersionID);

                for (let i = 0; i < configItem.Versions.length; i++) {
                    const values: TableValue[] = [];
                    const v = configItem.Versions[i];

                    const versionNumber = (configItem.Versions.length - i);
                    const createTime = await DateTimeUtil.getLocalDateTimeString(v.Definition.CreateTime);
                    const currentVersion = v.isCurrentVersion ? '(' + translatedCurrentVersion + ')' : '';
                    const currentVersionString = `${versionNumber} ${currentVersion}`;

                    const basedOnDefinitionString
                        = `${translatedVersion} ${v.Definition.Version} (${translatedCreated} ${createTime})`;

                    const columns = this.table.getColumns().map((c) => c.getColumnConfiguration());
                    for (const column of columns) {
                        if (column.property === VersionProperty.COUNT_NUMBER) {
                            values.push(
                                new TableValue(VersionProperty.COUNT_NUMBER, versionNumber, currentVersionString)
                            );
                        } else if (column.property === VersionProperty.BASED_ON_CLASS_VERSION) {
                            values.push(new TableValue(
                                VersionProperty.BASED_ON_CLASS_VERSION, v.Definition.Version, basedOnDefinitionString
                            ));
                        } else {
                            const tableValue = await this.getTableValue(v, column.property, column);
                            values.push(tableValue);
                        }
                    }

                    const newRowObject = new RowObject<Version>(values, v);
                    rowObjects.push(newRowObject);
                }
            }
        }

        return rowObjects;
    }
}
