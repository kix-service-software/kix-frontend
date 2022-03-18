/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PortalNotificationType } from './PortalNotificationType';

export class PortalNotification {

    public icon: string;

    public constructor(
        public id: string,
        public group: string,
        public type: PortalNotificationType,
        public title: string,
        public createTime: string,
        public isLocal: boolean = true,
        public preLogin: boolean = false,
        public teaserText: string = '',
        public fullText: string = '',
        public keywords: string = ''
    ) {
        switch (type) {
            case PortalNotificationType.ADVICE:
                this.icon = 'fas fa-align-left';
                break;
            case PortalNotificationType.IMPORTANT:
                this.icon = 'fas fa-exclamation';
                break;
            case PortalNotificationType.INFO:
                this.icon = 'fas fa-info';
                break;
            case PortalNotificationType.WARNING:
                this.icon = 'fas fa-exclamation-triangle';
                break;
            default:
        }
    }

}