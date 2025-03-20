/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { User } from '../../model/User';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { UserProperty } from '../../model/UserProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { ContactProperty } from '../../../customer/model/ContactProperty';
import { AbstractPlaceholderHandler } from '../../../base-components/webapp/core/AbstractPlaceholderHandler';
import { AgentService } from './AgentService';
import { OrganisationPlaceholderHandler } from '../../../customer/webapp/core/OrganisationPlaceholderHandler';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { Organisation } from '../../../customer/model/Organisation';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { DynamicFieldValuePlaceholderHandler } from '../../../dynamic-fields/webapp/core/DynamicFieldValuePlaceholderHandler';
import { KIXObjectLoadingOptions } from '../../../../model/KIXObjectLoadingOptions';

export class UserPlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '100-UserPlaceholderHandler';
    protected objectStrings: string[] = [
        'CURRENT', 'USER'
    ];

    public async replace(
        placeholder: string, user?: User, language?: string, forRichtext?: boolean, translate: boolean = true
    ): Promise<string> {
        let result = '';
        const objectString = PlaceholderService.getInstance().getObjectString(placeholder);
        if (objectString === 'CURRENT') {
            const currentUser = await AgentService.getInstance().getCurrentUser();
            if (currentUser) {
                user = currentUser;
            }
        }

        const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
        if (attribute === 'ORG' && user && user.Contact) {
            const optionsString = PlaceholderService.getInstance().getOptionsString(placeholder);
            if (optionsString) {
                placeholder = `<KIX_ORG_${optionsString}>`;
            }
            const organisations = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, [user.Contact.PrimaryOrganisationID]
            );
            if (Array.isArray(organisations) && organisations.length) {
                result = await OrganisationPlaceholderHandler.prototype.replace(
                    placeholder, organisations[0], language, forRichtext, translate
                );
            }
        }
        else if (
            PlaceholderService.getInstance().isDynamicFieldAttribute(attribute) &&
            DynamicFieldValuePlaceholderHandler
        ) {
            if (user && !user.Contact) {
                user = await this.loadUser(user.UserID);
            }
            if (user?.Contact) {
                const optionsString: string = PlaceholderService.getInstance().getOptionsString(placeholder);
                result = await DynamicFieldValuePlaceholderHandler.getInstance().replaceDFValue(
                    user.Contact, optionsString, language, forRichtext, translate
                );
            }
        }
        else if (user && attribute && this.isKnownProperty(attribute)) {
            switch (attribute) {
                case UserProperty.USER_ID:
                case KIXObjectProperty.VALID_ID:
                    result = user[attribute].toString();
                    break;
                // FIXME: use UserID else it will be ID of contact (change/remove it with placeholder refactoring)
                case 'ID':
                    result = user.UserID.toString();
                    break;
                case UserProperty.USER_LOGIN:
                case ContactProperty.FIRSTNAME:
                case ContactProperty.LASTNAME:
                case ContactProperty.COMMENT:
                case UserProperty.USER_COMMENT:
                case ContactProperty.TITLE:
                    result = await LabelService.getInstance().getDisplayText(user, attribute, undefined, false);
                    break;
                case ContactProperty.EMAIL:
                case ContactProperty.EMAIL1:
                case ContactProperty.EMAIL2:
                case ContactProperty.EMAIL3:
                case ContactProperty.EMAIL4:
                case ContactProperty.EMAIL5:
                    result = await LabelService.getInstance().getDisplayText(user, attribute, undefined, false);
                    if (forRichtext) {
                        result = result.replace(/>/g, '&gt;');
                        result = result.replace(/</g, '&lt;');
                    }
                    break;
                case KIXObjectProperty.CREATE_TIME:
                case KIXObjectProperty.CHANGE_TIME:
                    if (translate) {
                        result = await DateTimeUtil.getLocalDateTimeString(user[attribute], language);
                    } else {
                        result = user[attribute];
                    }
                    break;
                default:
                    result = await LabelService.getInstance().getDisplayText(
                        user, attribute, undefined, false
                    );
                    result = typeof result !== 'undefined' && result !== null
                        ? translate ? await TranslationService.translate(result.toString(), undefined, language)
                            : result.toString() : '';
            }
        }
        return result;
    }

    private async loadUser(userId: number): Promise<User> {
        if (userId) {
            const users = await KIXObjectService.loadObjects<User>(
                KIXObjectType.USER, [userId],
                new KIXObjectLoadingOptions(
                    undefined, undefined, undefined,
                    ['Contact']
                )
            ).catch(() => []);
            if (users.length) {
                return users[0];
            }
        }
        return;
    }

    private isKnownProperty(property: string): boolean {
        let knownProperties = Object.keys(UserProperty).map((p) => UserProperty[p]);
        knownProperties = [
            ...knownProperties,
            ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p]),
            ...Object.keys(ContactProperty).map((p) => ContactProperty[p]),
            // FIXME: change/remove it with placeholder refactoring
            'ContactID'
        ];
        return knownProperties.some((p) => p === property);
    }
}
