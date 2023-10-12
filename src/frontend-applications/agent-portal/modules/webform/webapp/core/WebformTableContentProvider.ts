/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { Table } from '../../../table/model/Table';
import { TableContentProvider } from '../../../table/webapp/core/TableContentProvider';

export class WebformTableContentProvider extends TableContentProvider {

    public constructor(
        table: Table, objectIds: number[], loadingOptions: KIXObjectLoadingOptions, contextId?: string
    ) {
        super(KIXObjectType.WEBFORM, table, objectIds, loadingOptions, contextId);
    }

}
