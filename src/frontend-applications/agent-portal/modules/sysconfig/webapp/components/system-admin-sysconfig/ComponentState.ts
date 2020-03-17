/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ITable } from "../../../../base-components/webapp/core/table";
import { AbstractComponentState } from "../../../../base-components/webapp/core/AbstractComponentState";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public instanceId: string = 'admin-sysconfig-overview',
        public table: ITable = null,
        public filterValue: string = '',
        public prepared: boolean = false,
        public title: string = "System: Sysconfig (0)",
        public placeholder: string = 'Please enter a search term.'
    ) {
        super();
    }

}
