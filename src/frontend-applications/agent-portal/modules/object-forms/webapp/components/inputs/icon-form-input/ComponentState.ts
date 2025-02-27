/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
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
        public value: string | ObjectIcon = null,
        public fileUpload: boolean = false,
        public libraryEnabled: boolean = true,
        public readonly: boolean = false
    ) {
        super();
    }

}
