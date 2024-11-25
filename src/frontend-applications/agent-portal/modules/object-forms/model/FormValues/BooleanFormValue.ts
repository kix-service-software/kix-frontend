/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { BrowserUtil } from '../../../base-components/webapp/core/BrowserUtil';
import { ObjectFormValueMapper } from '../ObjectFormValueMapper';
import { ObjectFormValue } from './ObjectFormValue';

export class BooleanFormValue extends ObjectFormValue<boolean> {

    public constructor(
        property: string,
        object: any,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue
    ) {
        super(property, object, objectValueMapper, parent);
        this.inputComponentId = 'checkbox-form-input';
    }

    async initFormValue(): Promise<void> {
        await super.initFormValue();
        const value = BrowserUtil.isBooleanTrue(this.object[this.property]);
        this.setFormValue(value, true);
    }

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        if (Array.isArray(value)) {
            value = value[0];
        }
        await super.setFormValue(Boolean(value), force);
    }

    public async setObjectValue(value: any): Promise<void> {
        await super.setObjectValue(value ? '1' : '0');
    }
}