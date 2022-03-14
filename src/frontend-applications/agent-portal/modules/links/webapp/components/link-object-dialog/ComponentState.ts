/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { Table } from '../../../../table/model/Table';
import { LinkTypeDescription } from '../../../model/LinkTypeDescription';
import { CreateLinkDescription } from '../../../server/api/CreateLinkDescription';
import { IdService } from '../../../../../model/IdService';

export class ComponentState {

    public constructor(
        public loadNodes: () => Promise<TreeNode[]> = null,
        public table: Table = null,
        public resultCount: number = 0,
        public currentLinkTypeDescription: LinkTypeDescription = null,
        public linkDescriptions: CreateLinkDescription[] = null,
        public canSubmit: boolean = false,
        public tableId: string = null,
        public filterCount: number = null,
        public translations: any = {},
        public linkTypeTreeId: string = IdService.generateDateBasedId('linkTypeTreeId')
    ) { }
}
