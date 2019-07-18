/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IPlaceholderHandler, PlaceholderService } from "../placeholder";
import { DateTimeUtil, KIXObjectProperty, KIXObjectType, Organisation, OrganisationProperty } from "../../model";
import { LabelService } from "../LabelService";
import { TranslationService } from "../i18n/TranslationService";

export class OrganisationPlaceholderHandler implements IPlaceholderHandler {

    public handlerId: string = 'OrganisationPlaceholderHandler';

    public isHandlerFor(objectString: string): boolean {
        return false;
    }

    public async replace(placeholder: string, organisation?: Organisation, language: string = 'en'): Promise<string> {
        let result = '';
        if (organisation) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);
            if (attribute && this.isKnownProperty(attribute)) {
                const orgLabelProvider = LabelService.getInstance().getLabelProviderForType(KIXObjectType.ORGANISATION);
                if (!PlaceholderService.getInstance().translatePlaceholder(placeholder)) {
                    language = 'en';
                }
                switch (attribute) {
                    case OrganisationProperty.ID:
                    case KIXObjectProperty.VALID_ID:
                        result = organisation[attribute] ? organisation[attribute].toString() : '';
                        break;
                    case OrganisationProperty.NUMBER:
                    case OrganisationProperty.NAME:
                    case OrganisationProperty.URL:
                    case OrganisationProperty.COMMENT:
                    case OrganisationProperty.STREET:
                    case OrganisationProperty.ZIP:
                        result = await orgLabelProvider.getDisplayText(organisation, attribute, undefined, false);
                        break;
                    case KIXObjectProperty.CREATE_TIME:
                    case KIXObjectProperty.CHANGE_TIME:
                        result = await DateTimeUtil.getLocalDateTimeString(organisation[attribute], language);
                        break;
                    default:
                        result = await orgLabelProvider.getDisplayText(organisation, attribute, undefined, false);
                        result = typeof result !== 'undefined' && result !== null
                            ? await TranslationService.translate(result.toString(), undefined, language) : '';
                }
            }
        }
        return result;
    }

    private isKnownProperty(property: string): boolean {
        let knownProperties = Object.keys(OrganisationProperty).map((p) => OrganisationProperty[p]);
        knownProperties = [...knownProperties, ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p])];
        return knownProperties.some((p) => p === property);
    }
}
