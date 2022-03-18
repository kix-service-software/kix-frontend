/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../../table/webapp/core/TableContentProvider';
import { Version } from '../../../../model/Version';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { ContextService } from '../../../../../../modules/base-components/webapp/core/ContextService';
import { TranslationService } from '../../../../../../modules/translation/webapp/core/TranslationService';
import { DateTimeUtil } from '../../../../../../modules/base-components/webapp/core/DateTimeUtil';
import { VersionProperty } from '../../../../model/VersionProperty';
import { RowObject } from '../../../../../table/model/RowObject';
import { Table } from '../../../../../table/model/Table';
import { TableValue } from '../../../../../table/model/TableValue';

export class ConfigItemVersionContentProvider extends TableContentProvider<Version> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM, table, objectIds, loadingOptions, contextId);
    }

    public async loadData(): Promise<Array<RowObject<Version>>> {
        const rowObjects = [];
        if (this.contextId) {
            const context = ContextService.getInstance().getActiveContext();
            const versions = await context.getObjectList(KIXObjectType.CONFIG_ITEM_VERSION);
            if (versions) {
                const translatedCurrentVersion = await TranslationService.translate('Translatable#current');
                const translatedCreated = await TranslationService.translate('Translatable#created');
                const translatedVersion = await TranslationService.translate('Translatable#Version');

                (versions as Version[]).sort((a, b) => b.VersionID - a.VersionID);

                for (let i = 0; i < versions.length; i++) {
                    const values: TableValue[] = [];
                    const v = versions[i] as Version;

                    const versionNumber = (versions.length - i);
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
                            const tableValue = new TableValue(column.property, v[column.property]);
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
