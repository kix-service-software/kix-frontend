/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from "../../../../../modules/base-components/webapp/core/AbstractComponentState";
import { ITable } from "../../core/table";
import { IDynamicFormManager } from "../../core/dynamic-form/IDynamicFormManager";

export class ComponentState extends AbstractComponentState {

    public constructor(
        public resultCount: number = 0,
        public canSearch: boolean = false,
        public table: ITable = null,
        public manager: IDynamicFormManager = null,
        public prepared: boolean = false
    ) {
        super();
    }

}
