/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from '../../../../modules/base-components/webapp/core/LabelProvider';
import { Organisation } from '../../model/Organisation';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { OrganisationProperty } from '../../model/OrganisationProperty';
import { TranslationService } from '../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { ObjectIcon } from '../../../icon/model/ObjectIcon';
import { KIXObject } from '../../../../model/kix/KIXObject';

export class OrganisationLabelProvider extends LabelProvider<Organisation> {

    public kixObjectType: KIXObjectType = KIXObjectType.ORGANISATION;

    public isLabelProviderFor(object: Organisation | KIXObject): boolean {
        return object instanceof Organisation || object?.KIXObjectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case OrganisationProperty.NUMBER:
                displayValue = 'Translatable#CNO';
                break;
            case OrganisationProperty.CITY:
                displayValue = 'Translatable#City';
                break;
            case OrganisationProperty.COUNTRY:
                displayValue = 'Translatable#Country';
                break;
            case OrganisationProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case OrganisationProperty.STREET:
                displayValue = 'Translatable#Street';
                break;
            case OrganisationProperty.URL:
                displayValue = 'Translatable#URL';
                break;
            case OrganisationProperty.ZIP:
                displayValue = 'Translatable#ZIP';
                break;
            case OrganisationProperty.ID:
                displayValue = 'Translatable#Organisation ID';
                break;
            case OrganisationProperty.OPEN_TICKETS_COUNT:
                displayValue = 'Translatable#Open Tickets';
                break;
            case OrganisationProperty.ESCALATED_TICKETS_COUNT:
                displayValue = 'Translatable#Escalated Tickets';
                break;
            case OrganisationProperty.REMINDER_TICKETS_COUNT:
                displayValue = 'Translatable#Reminder Tickets';
                break;
            default:
                displayValue = await super.getPropertyText(property, short, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue;
    }

    public async getDisplayText(
        organisation: Organisation, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = typeof defaultValue !== 'undefined' && defaultValue !== null
            ? defaultValue : organisation[property];

        switch (property) {
            case OrganisationProperty.NAME:
            case OrganisationProperty.NUMBER:
            case OrganisationProperty.STREET:
            case OrganisationProperty.URL:
            case OrganisationProperty.ZIP:
            case OrganisationProperty.CITY:
            case OrganisationProperty.COUNTRY:
                translatable = false;
                break;
            case OrganisationProperty.OPEN_TICKETS_COUNT:
                displayValue = organisation.TicketStats.OpenCount.toString();
                break;
            case OrganisationProperty.ESCALATED_TICKETS_COUNT:
                displayValue = organisation.TicketStats.EscalatedCount.toString();
                break;
            case OrganisationProperty.REMINDER_TICKETS_COUNT:
                displayValue = organisation.TicketStats.PendingReminderCount.toString();
                break;
            case OrganisationProperty.VALID:
                displayValue = await this.getPropertyValueDisplayText(
                    KIXObjectProperty.VALID_ID, organisation.ValidID, translatable
                );
                break;
            default:
                displayValue = await super.getDisplayText(organisation, property, displayValue, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getObjectText(
        organisation: Organisation, id: boolean = false, name: boolean = false, translatable: boolean = true
    ): Promise<string> {
        let returnString = '';
        if (organisation) {
            if (id) {
                returnString = organisation.ID.toString();
            }
            if (name) {
                returnString = organisation.Name;
            }
            if (!id && !name) {
                returnString = `${organisation.Name} (${organisation.Number})`;
            }
        } else {
            const organisationLabel = await TranslationService.translate('Translatable#Organisation');
            returnString = organisationLabel;
        }
        return returnString;
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-man-house';
    }

    public async getObjectName(plural: boolean = false, translatable: boolean = true): Promise<string> {
        const value = plural ? 'Translatable#Organisations' : 'Translatable#Organisation';

        const organisationLabel = translatable
            ? await TranslationService.translate(value)
            : plural ? 'Organisations' : 'Organisation';

        return organisationLabel;
    }

    public getObjectIcon(object?: Organisation): string | ObjectIcon {
        if (object) {
            return new ObjectIcon(null, KIXObjectType.ORGANISATION, object.ID, null, null, 'kix-icon-man-house');
        } else {
            return 'kix-icon-man-house';
        }
    }

}

