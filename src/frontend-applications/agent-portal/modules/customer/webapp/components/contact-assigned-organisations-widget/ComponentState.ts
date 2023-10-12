/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../../modules/base-components/webapp/core/WidgetComponentState';
import { Contact } from '../../../model/Contact';
import { Table } from '../../../../table/model/Table';
import { AbstractAction } from '../../../../../modules/base-components/webapp/core/AbstractAction';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public contact: Contact = null,
        public table: Table = null,
        public filterValue: string = '',
        public title: string = '',
        public actions: AbstractAction[] = [],
        public filterCount: number = null
    ) {
        super();
    }

}
