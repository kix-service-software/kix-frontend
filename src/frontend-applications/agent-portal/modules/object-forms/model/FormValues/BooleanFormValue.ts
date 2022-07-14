/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ObjectFormValueMapper } from '../ObjectFormValueMapper';
import { ObjectFormValue } from './ObjectFormValue';

export class BooleanFormValue extends ObjectFormValue<boolean> {

    public constructor(
        property: string,
        object: any,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'checkbox-form-input';
    }

    public async setFormValue(value: any): Promise<void> {
        if (Array.isArray(value)) {
            value = value[0];
        }
        await super.setFormValue(Boolean(value));
    }

    public async setObjectValue(value: any): Promise<void> {
        await super.setObjectValue(typeof value !== undefined ? value : 0);
    }
}