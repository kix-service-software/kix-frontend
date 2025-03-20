/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractAction } from '../../../base-components/webapp/core/AbstractAction';
import { ObjectFormValueMapper } from '../ObjectFormValueMapper';
import { ObjectFormValue } from './ObjectFormValue';

export abstract class FormValueAction extends AbstractAction {

    public constructor(
        public formValue: ObjectFormValue,
        public objectValueMapper: ObjectFormValueMapper
    ) {
        super();
    }

    public destroy(): void {
        return;
    }

    public isActive(): boolean {
        return;
    }

}