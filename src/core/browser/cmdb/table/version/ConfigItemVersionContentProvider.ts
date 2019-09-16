/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IRowObject, RowObject, ITable, TableValue } from "../../../table";
import {
    KIXObjectType, KIXObjectLoadingOptions, ConfigItem, Version, VersionProperty, DateTimeUtil
} from "../../../../model";
import { ContextService } from "../../../context";
import { TableContentProvider } from "../../../table/TableContentProvider";
import { TranslationService } from '../../../i18n/TranslationService';

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
        const rowObjects = [];
        if (this.contextId) {
            const context = await ContextService.getInstance().getContext(this.contextId);
            const configItem = await context.getObject<ConfigItem>();
            if (configItem) {
                const translatedCurrentVersion = await TranslationService.translate('Translatable#current');
                const translatedCreated = await TranslationService.translate('Translatable#created');
                const translatedVersion = await TranslationService.translate('Translatable#Version');

                const sortedVersions = configItem.Versions.sort((a, b) => b.VersionID - a.VersionID);

                for (let i = 0; i < sortedVersions.length; i++) {
                    const values: TableValue[] = [];
                    const v = sortedVersions[i];

                    for (const property in v) {
                        if (v.hasOwnProperty(property)) {
                            values.push(new TableValue(property, v[property]));
                        }
                    }

                    const versionNumber = (configItem.Versions.length - i);
                    const createTime = await DateTimeUtil.getLocalDateTimeString(v.Definition.CreateTime);
                    const currentVersion = v.isCurrentVersion ? '(' + translatedCurrentVersion + ')' : '';
                    const currentVersionString = `${versionNumber} ${currentVersion}`;
                    const basedOnDefinitionString
                        = `${translatedVersion} ${v.Definition.Version} (${translatedCreated} ${createTime})`;
                    values.push(new TableValue(VersionProperty.COUNT_NUMBER, versionNumber, currentVersionString));
                    values.push(new TableValue(
                        VersionProperty.BASED_ON_CLASS_VERSION, v.Definition.Version, basedOnDefinitionString
                    ));

                    const newRowObject = new RowObject<Version>(values, v);
                    rowObjects.push(newRowObject);

                }
            }
        }

        return rowObjects;
    }
}
