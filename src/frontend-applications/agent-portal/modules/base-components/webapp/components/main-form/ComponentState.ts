/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { FormInstance } from '../../core/FormInstance';

export class ComponentState {

    public constructor(
        public formId: string = null,
        public objectType: KIXObjectType | string = null,
        public formInstance: FormInstance = null,
        public isSearchContext: boolean = false,
        public loading: boolean = true,
        public additionalFieldControlsNeeded: boolean = false,
        public activePageIndex: number = 0
    ) { }

}
