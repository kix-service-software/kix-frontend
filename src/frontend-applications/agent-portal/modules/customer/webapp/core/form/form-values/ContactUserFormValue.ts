/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { CRUD } from '../../../../../../../../server/model/rest/CRUD';
import { FormValueProperty } from '../../../../../object-forms/model/FormValueProperty';
import { ObjectFormValue } from '../../../../../object-forms/model/FormValues/ObjectFormValue';
import { ObjectFormValueMapper } from '../../../../../object-forms/model/ObjectFormValueMapper';
import { User } from '../../../../../user/model/User';
import { UserProperty } from '../../../../../user/model/UserProperty';
import { AgentService } from '../../../../../user/webapp/core/AgentService';
import { Contact } from '../../../../model/Contact';
import { UserAccessFormValue } from './UserAccessFormValue';

export class ContactUserFormValue extends ObjectFormValue {

    public constructor(
        property: string,
        contact: Contact,
        objectValueMapper: ObjectFormValueMapper,
        public parent: ObjectFormValue,
    ) {
        super(property, contact, objectValueMapper, parent);

        this.inputComponentId = null;

        if (!contact.User) {
            contact.User = new User();
        }

        const userAccessFormValue = new UserAccessFormValue(
            UserProperty.USER_ACCESS, contact.User, objectValueMapper, this
        );
        this.formValues.push(userAccessFormValue);

        this.enabled = true;
        this.visible = true;

    }

    public async initFormValue(): Promise<void> {
        const hasUserCreatePermission = await AgentService.checkPermissions('system/users', [CRUD.CREATE]);

        if (!hasUserCreatePermission) {
            await this.disable();
            return;
        }

        for (const fv of this.formValues) {
            await fv.enable();
        }
    }

}