/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IPlaceholderHandler } from "../../../../modules/base-components/webapp/core/IPlaceholderHandler";
import { User } from "../../model/User";
import { PlaceholderService } from "../../../../modules/base-components/webapp/core/PlaceholderService";
import { AgentService } from ".";
import { LabelService } from "../../../../modules/base-components/webapp/core/LabelService";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { UserProperty } from "../../model/UserProperty";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";
import { DateTimeUtil } from "../../../../modules/base-components/webapp/core/DateTimeUtil";
import { TranslationService } from "../../../../modules/translation/webapp/core/TranslationService";

export class UserPlaceholderHandler implements IPlaceholderHandler {

    public handlerId: string = 'UserPlaceholderHandler';

    public isHandlerFor(objectString: string): boolean {
        return objectString === 'CURRENT';
    }

    public async replace(placeholder: string, user?: User, language: string = 'en'): Promise<string> {
        let result = '';
        const objectString = PlaceholderService.getInstance().getObjectString(placeholder);
        if (objectString === 'CURRENT') {
            const currentUser = await AgentService.getInstance().getCurrentUser();
            if (currentUser) {
                user = currentUser;
            }
        }
        if (user) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
            if (attribute && this.isKnownProperty(attribute)) {
                const userLabelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.USER);
                if (!PlaceholderService.getInstance().translatePlaceholder(placeholder)) {
                    language = 'en';
                }
                switch (attribute) {
                    case UserProperty.USER_ID:
                    case KIXObjectProperty.VALID_ID:
                        result = user[attribute].toString();
                        break;
                    case UserProperty.USER_LOGIN:
                    case UserProperty.USER_FIRSTNAME:
                    case UserProperty.USER_LASTNAME:
                    case UserProperty.USER_EMAIL:
                    case UserProperty.USER_COMMENT:
                    case UserProperty.USER_TITLE:
                        result = await userLabelProvider.getDisplayText(user, attribute, undefined, false);
                        break;
                    case KIXObjectProperty.CREATE_TIME:
                    case KIXObjectProperty.CHANGE_TIME:
                        result = await DateTimeUtil.getLocalDateTimeString(user[attribute], language);
                        break;
                    default:
                        result = await userLabelProvider.getDisplayText(user, attribute, undefined, false);
                        result = typeof result !== 'undefined' && result !== null
                            ? await TranslationService.translate(result.toString(), undefined, language) : '';
                }
            }
        }
        return result;
    }

    private isKnownProperty(property: string): boolean {
        let knownProperties = Object.keys(UserProperty).map((p) => UserProperty[p]);
        knownProperties = [...knownProperties, ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p])];
        return knownProperties.some((p) => p === property);
    }
}
