/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';
import { FormValueAction } from '../../../model/FormValues/FormValueAction';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public prepared: boolean = false,
        public actions: FormValueAction[] = [],
        public visibleActions: FormValueAction[] = [],
        public expandableActions: FormValueAction[] = [],
        public isSelectInput: boolean = false
    ) {
        super();
    }

}