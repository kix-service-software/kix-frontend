/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { WidgetComponentState, KIXObjectPropertyFilter, IAction, ObjectIcon } from "../../../core/model";
import { ITable } from "../../../core/browser";

export class ComponentState extends WidgetComponentState {

    public constructor(
        public table: ITable = null,
        public predefinedTableFilter: KIXObjectPropertyFilter[] = [],
        public actions: IAction[] = [],
        public title: string = null,
        public icon: string | ObjectIcon = null,
        public filterCount: number = null,
        public headerTitleComponents: string[] = [],
        public filterPlaceHolder: string = 'Translatable#All Objects',
        public showFilter: boolean = true,
        public isFiltering: boolean = false
    ) {
        super();
    }

}
