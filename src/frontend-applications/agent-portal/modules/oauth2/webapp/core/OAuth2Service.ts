/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { OAuth2Profile } from '../../model/OAuth2Profile';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';


export class OAuth2Service extends KIXObjectService<OAuth2Profile> {

    private static INSTANCE: OAuth2Service = null;

    public static getInstance(): OAuth2Service {
        if (!OAuth2Service.INSTANCE) {
            OAuth2Service.INSTANCE = new OAuth2Service();
        }

        return OAuth2Service.INSTANCE;
    }

    private constructor() {
        super(KIXObjectType.OAUTH2_PROFILE);
        this.objectConstructors.set(KIXObjectType.OAUTH2_PROFILE, [OAuth2Profile]);
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.OAUTH2_PROFILE
            || kixObjectType === KIXObjectType.OAUTH2_PROFILE_AUTH_URL;
    }

    public getLinkObjectName(): string {
        return 'OAuth2Profile';
    }
}
