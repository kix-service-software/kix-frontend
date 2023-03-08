/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Contact } from '../../model/Contact';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { ContactProperty } from '../../model/ContactProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { UserProperty } from '../../../user/model/UserProperty';
import { AbstractPlaceholderHandler } from '../../../base-components/webapp/core/AbstractPlaceholderHandler';
import { DynamicFieldValuePlaceholderHandler } from '../../../dynamic-fields/webapp/core/DynamicFieldValuePlaceholderHandler';

export class ContactPlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '200-ContactPlaceholderHandler';

    protected objectStrings: string[] = ['CONTACT'];

    public async replace(placeholder: string, contact?: Contact, language?: string): Promise<string> {
        let result = '';
        if (contact) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);

            if (
                PlaceholderService.getInstance().isDynamicFieldAttribute(attribute) &&
                DynamicFieldValuePlaceholderHandler
            ) {
                const optionsString: string = PlaceholderService.getInstance().getOptionsString(placeholder);
                result = await DynamicFieldValuePlaceholderHandler.getInstance().replaceDFValue(contact, optionsString);
            }
            else if (attribute && this.isKnownProperty(attribute)) {
                switch (attribute) {
                    case ContactProperty.ID:
                    case KIXObjectProperty.VALID_ID:
                    case ContactProperty.PRIMARY_ORGANISATION_ID:
                    case ContactProperty.ORGANISATION_IDS:
                        result = contact[attribute] ? contact[attribute].toString() : '';
                        break;
                    case UserProperty.USER_LOGIN:
                    case ContactProperty.FIRSTNAME:
                    case ContactProperty.LASTNAME:
                    case ContactProperty.EMAIL:
                    case ContactProperty.COMMENT:
                    case ContactProperty.TITLE:
                    case ContactProperty.STREET:
                    case ContactProperty.ZIP:
                        result = await LabelService.getInstance().getDisplayText(contact, attribute, undefined, false);
                        break;
                    case KIXObjectProperty.CREATE_TIME:
                    case KIXObjectProperty.CHANGE_TIME:
                        result = await DateTimeUtil.getLocalDateTimeString(contact[attribute], language);
                        break;
                    default:
                        result = await LabelService.getInstance().getDisplayText(contact, attribute, undefined, false);
                        result = typeof result !== 'undefined' && result !== null
                            ? await TranslationService.translate(result.toString(), undefined, language) : '';
                }
            }
        }
        return result;
    }

    private isKnownProperty(property: string): boolean {
        let knownProperties = Object.keys(ContactProperty).map((p) => ContactProperty[p]);
        knownProperties = [
            ...knownProperties,
            ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p]),
            ...Object.keys(UserProperty).map((p) => UserProperty[p])
        ];
        return knownProperties.some((p) => p === property);
    }
}
