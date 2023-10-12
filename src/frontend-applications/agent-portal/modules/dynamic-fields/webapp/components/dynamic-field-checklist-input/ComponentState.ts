/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormInputComponentState } from '../../../../base-components/webapp/core/FormInputComponentState';
import { CheckListItem } from '../../core/CheckListItem';

export class ComponentState extends FormInputComponentState {

    public constructor(
        public prepared: boolean = false,
        public checklist: CheckListItem[] = [],
        public progressValue: number = 0,
        public progressMax: number = 0,
        public minimized: boolean = false
    ) {
        super();
    }

}
