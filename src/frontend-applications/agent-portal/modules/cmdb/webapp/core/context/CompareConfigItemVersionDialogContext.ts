/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { Version } from '../../../model/Version';
import { TableConfiguration } from '../../../../../model/configuration/TableConfiguration';
import { IColumnConfiguration } from '../../../../../model/configuration/IColumnConfiguration';
import { DefaultColumnConfiguration } from '../../../../../model/configuration/DefaultColumnConfiguration';
import { DataType } from '../../../../../model/DataType';
import { ContextService } from '../../../../../modules/base-components/webapp/core/ContextService';
import { ConfigItemDetailsContext } from '.';
import { ConfigItem } from '../../../model/ConfigItem';

export class CompareConfigItemVersionDialogContext extends Context {

    public static CONTEXT_ID: string = 'compare-config-item-version-dialog-context';

    public async setObjectList(objectType: KIXObjectType, versions: Version[]) {
        super.setObjectList(objectType, versions);

        const widget = await this.getWidgetConfiguration('compare-ci-version-widget');
        if (widget) {
            widget.configuration.tableConfiguration = new TableConfiguration(null, null, null);
            const columns: IColumnConfiguration[] = [
                new DefaultColumnConfiguration(null, null, null,
                    'CONFIG_ITEM_ATTRIBUTE', true, false, true, false, 250, false, false, false, DataType.STRING, true,
                    'multiline-cell'
                )
            ];

            const context = await ContextService.getInstance().getContext<ConfigItemDetailsContext>(
                ConfigItemDetailsContext.CONTEXT_ID
            );
            const configItem = await context.getObject<ConfigItem>(KIXObjectType.CONFIG_ITEM);

            versions.forEach((v) => {
                columns.push(
                    new DefaultColumnConfiguration(null, null, null,
                        v.VersionID.toString(), true, false, true, false, 250,
                        false, false, false, DataType.STRING, true, 'multiline-cell',
                        `Version ${this.getVersionNumber(v.VersionID, [...configItem.Versions])}`
                    )
                );
            });
            widget.configuration.tableConfiguration.tableColumns = columns;
        }
    }

    private getVersionNumber(versionId: number, versions: Version[]): number {
        versions.sort((a, b) => a.VersionID - b.VersionID);
        const index = versions.findIndex((v) => v.VersionID === versionId);
        return index + 1;
    }
}
