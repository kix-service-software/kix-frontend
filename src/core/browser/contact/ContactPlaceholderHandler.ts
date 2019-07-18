/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IPlaceholderHandler, PlaceholderService } from "../placeholder";
import { DateTimeUtil, KIXObjectProperty, KIXObjectType, Contact, ContactProperty } from "../../model";
import { LabelService } from "../LabelService";
import { TranslationService } from "../i18n/TranslationService";

export class ContactPlaceholderHandler implements IPlaceholderHandler {

    public handlerId: string = 'ContactPlaceholderHandler';

    public isHandlerFor(objectString: string): boolean {
        return false;
    }

    public async replace(placeholder: string, contact?: Contact, language: string = 'en'): Promise<string> {
        let result = '';
        if (contact) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
            if (attribute && this.isKnownProperty(attribute)) {
                const contactLabelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.CONTACT);
                if (!PlaceholderService.getInstance().translatePlaceholder(placeholder)) {
                    language = 'en';
                }
                switch (attribute) {
                    case ContactProperty.ID:
                    case KIXObjectProperty.VALID_ID:
                    case ContactProperty.PRIMARY_ORGANISATION_ID:
                    case ContactProperty.ORGANISATION_IDS:
                        result = contact[attribute] ? contact[attribute].toString() : '';
                        break;
                    case ContactProperty.LOGIN:
                    case ContactProperty.FIRSTNAME:
                    case ContactProperty.LASTNAME:
                    case ContactProperty.EMAIL:
                    case ContactProperty.COMMENT:
                    case ContactProperty.TITLE:
                    case ContactProperty.STREET:
                    case ContactProperty.ZIP:
                        result = await contactLabelProvider.getDisplayText(contact, attribute, undefined, false);
                        break;
                    case KIXObjectProperty.CREATE_TIME:
                    case KIXObjectProperty.CHANGE_TIME:
                        result = await DateTimeUtil.getLocalDateTimeString(contact[attribute], language);
                        break;
                    default:
                        result = await contactLabelProvider.getDisplayText(contact, attribute, undefined, false);
                        result = typeof result !== 'undefined' && result !== null
                            ? await TranslationService.translate(result.toString(), undefined, language) : '';
                }
            }
        }
        return result;
    }

    private isKnownProperty(property: string): boolean {
        let knownProperties = Object.keys(ContactProperty).map((p) => ContactProperty[p]);
        knownProperties = [...knownProperties, ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p])];
        return knownProperties.some((p) => p === property);
    }
}
