/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../../../model/kix/KIXObject';
import { AbstractComponentState } from '../../../../../modules/base-components/webapp/core/AbstractComponentState';
import { Table } from '../../../../table/model/Table';
import { CreateLinkDescription } from '../../../server/api/CreateLinkDescription';



export class ComponentState extends AbstractComponentState {

    public constructor(
        public loading: boolean = false,
        public linkObjectCount: number = 0,
        public table: Table = null,
        public canDelete: boolean = false,
        public canSubmit: boolean = false,
        public allowDelete: boolean = false,
        public allowCreate: boolean = false,
        public linkDescriptions: CreateLinkDescription[] = [],
        public mainObject: KIXObject = null,
        public title: string = 'Edit Links',
        public filterPlaceholder: string = 'enter filter value'
    ) {
        super();
    }

}
