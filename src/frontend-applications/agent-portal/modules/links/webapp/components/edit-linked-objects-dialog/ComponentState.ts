/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
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
        public title: string = 'Edit Links'
    ) {
        super();
    }

}
