/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AuthMethod } from '../../../../../model/AuthMethod';
import { InputFieldTypes } from '../../../../base-components/webapp/core/InputFieldTypes';
import { PortalNotification } from '../../../../portal-notification/model/PortalNotification';

export class ComponentState {

    public constructor(
        public loading: boolean = true,
        public loginProcess: boolean = false,
        public valid: boolean = false,
        public error: boolean = false,
        public doLogin: boolean = false,
        public logout: boolean = false,
        public unsupportedBrowser: boolean = false,
        public userName: string = null,
        public notifications: PortalNotification[] = [],
        public passwordFieldType: string = (InputFieldTypes.PASSWORD).toLowerCase(),
        public password: string = '',
        public hasLogin: boolean = false,
        public authMethods: AuthMethod[] = null,
        public prepared: boolean = false,
        public showMFA: boolean = false,
        public mfaToken: string = null,
        public pwResetEnabled: boolean = false,
        public showPWResetDialog: boolean = false,
        public pwResetState: string = '',
    ) { }

}
