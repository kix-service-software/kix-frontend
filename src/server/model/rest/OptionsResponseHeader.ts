/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { RequestMethod } from './RequestMethod';
import { ResponseHeader } from './ResponseHeader';
import { CRUD } from './CRUD';

export class OptionsResponseHeader {

    public Allow: RequestMethod[] = [];

    public AllowPermissionValue: CRUD = 0;

    public constructor(headers: any) {
        if (headers[ResponseHeader.ALLOW]) {
            this.Allow = headers[ResponseHeader.ALLOW].split(',');

            this.Allow.forEach((m) => {
                let value = 0;
                const method = m.trim();
                if (method === RequestMethod.POST) {
                    value = CRUD.CREATE;
                } else if (method === RequestMethod.GET) {
                    value = CRUD.READ;
                } else if (method === RequestMethod.PATCH) {
                    value = CRUD.UPDATE;
                } else if (method === RequestMethod.DELETE) {
                    value = CRUD.DELETE;
                }

                this.AllowPermissionValue = this.AllowPermissionValue | value;
            });
        }
    }

}
