/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { NotificationConfigValue } from './NotificationConfigValue';
import { NotificationProperty } from './NotificationProperty';

export class NotificationConfig {

    public static config = new Map(
        [
            [
                NotificationProperty.MESSAGE_CONTENTTYPE, [
                    new NotificationConfigValue('text/html', 'Translatable#Richtext'),
                    new NotificationConfigValue('text/plain', 'Translatable#Plaintext')
                ]
            ]
        ]
    );

    public static getContentType(): NotificationConfigValue[] {
        return NotificationConfig.config.get(NotificationProperty.MESSAGE_CONTENTTYPE);
    }

}