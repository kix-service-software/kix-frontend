/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Organisation } from '../../model/Organisation';
import { PlaceholderService } from '../../../../modules/base-components/webapp/core/PlaceholderService';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';
import { OrganisationProperty } from '../../model/OrganisationProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { DateTimeUtil } from '../../../../modules/base-components/webapp/core/DateTimeUtil';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { AbstractPlaceholderHandler } from '../../../base-components/webapp/core/AbstractPlaceholderHandler';
import { DynamicFieldValuePlaceholderHandler } from '../../../dynamic-fields/webapp/core/DynamicFieldValuePlaceholderHandler';

export class OrganisationPlaceholderHandler extends AbstractPlaceholderHandler {

    public handlerId: string = '250-OrganisationPlaceholderHandler';

    protected objectStrings: string[] = ['ORGANISATION'];


    public async replace(
        placeholder: string, organisation?: Organisation, language?: string, forRichtext?: boolean,
        translate: boolean = true
    ): Promise<string> {
        let result = '';
        if (organisation) {
            const attribute: string = PlaceholderService.getInstance().getAttributeString(placeholder);

            if (
                PlaceholderService.getInstance().isDynamicFieldAttribute(attribute) &&
                DynamicFieldValuePlaceholderHandler
            ) {
                const optionsString: string = PlaceholderService.getInstance().getOptionsString(placeholder);
                result = await DynamicFieldValuePlaceholderHandler.getInstance().replaceDFValue(
                    organisation, optionsString, language, forRichtext, translate
                );
            }
            else if (attribute && this.isKnownProperty(attribute)) {
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
                        result = await LabelService.getInstance().getDisplayText(
                            organisation, attribute, undefined, false
                        );
                        break;
                    case KIXObjectProperty.CREATE_TIME:
                    case KIXObjectProperty.CHANGE_TIME:
                        if (translate) {
                            result = await DateTimeUtil.getLocalDateTimeString(organisation[attribute], language);
                        } else {
                            result = organisation[attribute];
                        }
                        break;
                    default:
                        result = await LabelService.getInstance().getDisplayText(
                            organisation, attribute, undefined, false
                        );
                        result = typeof result !== 'undefined' && result !== null
                            ? translate ? await TranslationService.translate(result.toString(), undefined, language)
                                : result.toString() : '';
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
