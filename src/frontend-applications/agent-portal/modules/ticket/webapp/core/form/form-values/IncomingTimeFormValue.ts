/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { DateTimeUtil } from '../../../../../base-components/webapp/core/DateTimeUtil';
import { DateTimeFormValue } from '../../../../../object-forms/model/FormValues/DateTimeFormValue';

export class IncomingTimeFormValue extends DateTimeFormValue {

    public async setFormValue(value: any, force?: boolean): Promise<void> {
        if (!isNaN(value)) {
            value = new Date(Number(value));
        }
        return super.setFormValue(value, force);
    }

    public setObjectValue(value: any): Promise<void> {
        if (value) {
            value = DateTimeUtil.getKIXDateTimeString(value, true);
        }
        return super.setObjectValue(value);
    }

}
