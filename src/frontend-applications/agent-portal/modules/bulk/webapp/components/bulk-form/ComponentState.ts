/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IdService } from '../../../../../model/IdService';
import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { Table } from '../../../../table/model/Table';
import { LinkManager } from '../../../../links/webapp/core/LinkManager';
import { BulkManager } from '../../core/BulkManager';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public objectCount: number = 0,
        public table: Table = null,
        public bulkManager: BulkManager = null,
        public linkManager: LinkManager = null,
        public tableTitle: string = '',
        public canRun: boolean = false,
        public run: boolean = false,
        public componentId: string = IdService.generateDateBasedId()
    ) {
        super();
    }

}
