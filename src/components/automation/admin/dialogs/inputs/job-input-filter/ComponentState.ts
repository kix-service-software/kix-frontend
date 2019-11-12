/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState } from "../../../../../../core/model";
import { JobFilterManager } from "../../../../../../core/browser/job";

export class ComponentState extends FormInputComponentState<Array<[string, string[] | number[]]>> {

    public constructor(
        public manager: JobFilterManager = new JobFilterManager(),
        public prepared: boolean = false
    ) {
        super();
    }

}