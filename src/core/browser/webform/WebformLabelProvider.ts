/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { LabelProvider } from "../LabelProvider";
import { WebformProperty, Webform } from "../../model/webform";
import { KIXObjectService } from "../kix";
import { Queue, KIXObjectType, TicketType, TicketPriority, TicketState, ObjectIcon } from "../../model";
import { TranslationService } from "../i18n/TranslationService";

export class WebformLabelProvider extends LabelProvider {

    public constructor() {
        super();
        this.kixObjectType = KIXObjectType.WEBFORM;
    }

    public isLabelProviderFor(object: Webform): boolean {
        return object instanceof Webform;
    }

    public async getPropertyValueDisplayText(
        property: string, value: any, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        switch (property) {
            case WebformProperty.QUEUE_ID:
                if (value) {
                    const queues = await KIXObjectService.loadObjects<Queue>(
                        KIXObjectType.QUEUE, [value], null, null, true
                    ).catch((error) => [] as Queue[]);
                    const queue = queues.find((q) => q.QueueID.toString() === value.toString());
                    displayValue = queue ? queue.Name : value;
                }
                break;
            case WebformProperty.STATE_ID:
                if (value) {
                    const states = await KIXObjectService.loadObjects<TicketState>(
                        KIXObjectType.TICKET_STATE, [value], null, null, true
                    ).catch((error) => []);
                    displayValue = states && !!states.length ? states[0].Name : value;
                }
                break;
            case WebformProperty.PRIORITY_ID:
                if (value) {
                    const priority = await KIXObjectService.loadObjects<TicketPriority>(
                        KIXObjectType.TICKET_PRIORITY, [value], null, null, true
                    ).catch((error) => []);
                    displayValue = priority && !!priority.length ? priority[0].Name : value;
                }
                break;
            case WebformProperty.TYPE_ID:
                if (value) {
                    const types = await KIXObjectService.loadObjects<TicketType>(
                        KIXObjectType.TICKET_TYPE, [value], null, null, true
                    ).catch((error) => []);
                    displayValue = types && !!types.length ? types[0].Name : value;
                }
                break;
            default:
                displayValue = await super.getPropertyValueDisplayText(property, value, translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }
        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue: string;
        switch (property) {
            case WebformProperty.TITLE:
                displayValue = 'Translatable#Title';
                break;
            case WebformProperty.PRIORITY_ID:
                displayValue = short ? 'Translatable#Prio' : 'Translatable#Priority';
                break;
            case WebformProperty.TYPE_ID:
                displayValue = 'Translatable#Type';
                break;
            case WebformProperty.QUEUE_ID:
                displayValue = 'Translatable#Queue';
                break;
            case WebformProperty.STATE_ID:
                displayValue = 'Translatable#State';
                break;
            default:
                displayValue = await super.getPropertyText(property);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getDisplayText(
        webform: Webform, property: string, defaultValue?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue: string;

        const existingValue = webform.displayValues.find((dv) => dv[0] === property);
        if (existingValue) {
            displayValue = existingValue[1];
        } else {
            displayValue = await this.getPropertyValueDisplayText(property, webform[property], translatable);
        }

        if (displayValue) {
            displayValue = await TranslationService.translate(
                displayValue.toString(), undefined, undefined, !translatable
            );
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getIcons(
        webform: Webform, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (webform) {
            value = webform[property];
        }
        const icons = [];

        switch (property) {
            case WebformProperty.PRIORITY_ID:
                icons.push(new ObjectIcon('Priority', value));
                break;
            case WebformProperty.TYPE_ID:
                icons.push(new ObjectIcon('TicketType', value));
                break;
            case WebformProperty.QUEUE_ID:
                icons.push(new ObjectIcon('Queue', value));
                break;
            case WebformProperty.STATE_ID:
                icons.push(new ObjectIcon('TicketState', value));
                break;
            default:
        }

        return icons;
    }

}
