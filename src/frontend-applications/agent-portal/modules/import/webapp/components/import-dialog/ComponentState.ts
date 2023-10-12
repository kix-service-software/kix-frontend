/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { ImportManager } from '../../core';
import { Table } from '../../../../table/model/Table';
import { IdService } from '../../../../../model/IdService';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = IdService.generateDateBasedId('import-dialog-'),
        public importManager: ImportManager = null,
        public table: Table = null,
        public tableTitle: string = null,
        public canRun: boolean = false,
        public run: boolean = false,
        public prepared: boolean = false,
        public title: string = null
    ) {
        super();
    }

}
