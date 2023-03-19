/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../model/kix/KIXObject';
import { KIXObjectType } from '../../model/kix/KIXObjectType';

export class ClientRegistration extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = KIXObjectType.CLIENT_REGISTRATION;

    public ClientID: string;

    public NotificationURL: string;

    public Authorization: string;

    public NotificationInterval: number = 5;

    public constructor() {
        super();
        this.ObjectId = this.ClientID;
    }

    public equals(registration: ClientRegistration): boolean {
        return registration.ClientID === this.ClientID;
    }

    public getIdPropertyName(): string {
        return 'ClientID';
    }

}
