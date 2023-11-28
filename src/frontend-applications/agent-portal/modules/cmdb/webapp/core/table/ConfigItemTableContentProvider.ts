/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../table/webapp/core/TableContentProvider';
import { ConfigItem } from '../../../model/ConfigItem';
import { Table } from '../../../../table/model/Table';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ConfigItemProperty } from '../../../model/ConfigItemProperty';

export class ConfigItemTableContentProvider extends TableContentProvider<ConfigItem> {

    public constructor(
        table: Table,
        objectIds: number[],
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.CONFIG_ITEM, table, objectIds, loadingOptions, contextId);
        this.useBackendSort = true;
    }

    protected getSortAttribute(attribute: string): string {
        switch (attribute) {
            case ConfigItemProperty.CUR_DEPL_STATE_ID:
                return 'DeplState';
            case ConfigItemProperty.CUR_INCI_STATE_ID:
                return 'InciState';
            case ConfigItemProperty.CLASS_ID:
                return ConfigItemProperty.CLASS;
            default:
        }
        return super.getSortAttribute(attribute);
    }

}
