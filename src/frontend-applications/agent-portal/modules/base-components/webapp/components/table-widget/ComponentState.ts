/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState } from '../../../../../modules/base-components/webapp/core/WidgetComponentState';
import { Table } from '../../core/table';
import { KIXObjectPropertyFilter } from '../../../../../model/KIXObjectPropertyFilter';
import { IAction } from '../../../../../modules/base-components/webapp/core/IAction';
import { ObjectIcon } from '../../../../icon/model/ObjectIcon';

export class ComponentState extends WidgetComponentState {

    public constructor(
        public table: Table = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public predefinedFilterName: string = null,
        public actions: IAction[] = [],
        public title: string = null,
        public icon: string | ObjectIcon = null,
        public filterCount: number = null,
        public headerTitleComponents: string[] = [],
        public filterPlaceholder: string = 'Translatable#All Objects',
        public showFilter: boolean = true,
        public isFiltering: boolean = false,
        public loading: boolean = true,
        public filterValue: string = null,
    ) {
        super();
    }

}
