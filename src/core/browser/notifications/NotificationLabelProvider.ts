/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from "../LabelProvider";
import { NotificationProperty, Notification, KIXObjectType } from "../../model";
import { TranslationService } from "../i18n/TranslationService";

export class NotificationLabelProvider extends LabelProvider {

    public isLabelProviderFor(notification: Notification): boolean {
        return notification instanceof Notification;
    }

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === KIXObjectType.NOTIFICATION;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case NotificationProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            default:
                displayValue = await super.getPropertyText(property, false, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

}
