/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractComponentState } from '../../../../base-components/webapp/core/AbstractComponentState';
import { ObjectFormValue } from '../../../model/FormValues/ObjectFormValue';

export class ComponentState extends AbstractComponentState {

    public constructor(
        public formValues: ObjectFormValue[] = [],
        public prepared: boolean = false,
        public submitPattern: string = 'Translatable#Save',
        public blocked: boolean = false,
        public error: string = null
    ) {
        super();
    }

}