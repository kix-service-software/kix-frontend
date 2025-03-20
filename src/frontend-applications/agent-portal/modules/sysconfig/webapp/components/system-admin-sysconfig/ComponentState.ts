/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Table } from '../../../../table/model/Table';
import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = 'admin-sysconfig-overview',
        public table: Table = null,
        public prepared: boolean = false,
        public title: string = 'System: Sysconfig (0)',
        public placeholder: string = 'Please enter a search term.',
        public filterValue: string = ''
    ) {
        super();
    }

}
