/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';
import { Table } from '../../../model/Table';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public table: Table = null,
        public tableHeight: string = 'unset',
        public prepared: boolean = false,
        public showLoadingShield: boolean = false
    ) {
        super();
    }

}
