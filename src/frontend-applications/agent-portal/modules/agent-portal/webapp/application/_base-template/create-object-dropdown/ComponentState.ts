/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../../base-components/webapp/core/AbstractComponentState';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';


export class ComponentState extends AbstractComponentState {

    public constructor(
        public placeholder: string = '',
        public prepared: boolean = false,
        public treeId: string = 'new-object-dropdown',
        public values: Array<[string, string, string | ObjectIcon]> = [],
        public selectedValue: [string, string, string | ObjectIcon] = null
    ) {
        super();
    }

}
