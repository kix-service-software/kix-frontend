/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TableContentProvider } from '../../../../base-components/webapp/core/table/TableContentProvider';
import { Table } from '../../../../base-components/webapp/core/table';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { TextModule } from '../../../model/TextModule';

export class TextModulesTableContentProvider extends TableContentProvider<TextModule> {

    public constructor(
        table: Table,
        objectIds: Array<string | number>,
        loadingOptions: KIXObjectLoadingOptions,
        contextId?: string
    ) {
        super(KIXObjectType.TEXT_MODULE, table, objectIds, loadingOptions, contextId);
    }

}
