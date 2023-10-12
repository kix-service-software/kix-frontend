/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';

export class OAuth2Profile extends KIXObject {

    public KIXObjectType: KIXObjectType = KIXObjectType.OAUTH2_PROFILE;

    public ObjectId: string | number;

    public ID: string | number;
    public ClientID: string;
    public Name: string;
    public Scope: string;
    public URLAuth: string;
    public URLRedirect: string;
    public URLToken: string;
    public HasAccessToken: number;

    public constructor(profile?: OAuth2Profile) {
        super(profile);
        if (profile) {
            this.ID = profile.ID;
            this.ObjectId = this.ID;
            this.ClientID = profile.ClientID;
            this.Name = profile.Name;
            this.Scope = profile.Scope;
            this.URLAuth = profile.URLAuth;
            this.URLRedirect = profile.URLRedirect;
            this.URLToken = profile.URLToken;
            this.HasAccessToken = profile.HasAccessToken;
        }
    }

}
