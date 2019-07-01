import { IPlaceholderHandler, PlaceholderService } from "../placeholder";
import { DateTimeUtil, User, UserProperty, KIXObjectProperty, KIXObjectType } from "../../model";
import { LabelService } from "../LabelService";
import { TranslationService } from "../i18n/TranslationService";
import { AgentService } from "../application/AgentService";

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
