import {
    KIXObjectType, ObjectIcon, DateTimeUtil, User, Queue, QueueProperty, SystemAddress, FollowUpType, KIXObjectProperty
} from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { ObjectDataService } from "../ObjectDataService";
import { KIXObjectService } from "../kix";
import { LabelService } from "../LabelService";
import { LabelProvider } from "../LabelProvider";

export class QueueLabelProvider extends LabelProvider<Queue> {

    public kixObjectType: KIXObjectType = KIXObjectType.QUEUE;

    public isLabelProviderFor(queue: Queue): boolean {
        return queue instanceof Queue;
    }

    public isLabelProviderForType(objectType: KIXObjectType): boolean {
        return objectType === this.kixObjectType;
    }

    public async getPropertyText(property: string, short?: boolean, translatable: boolean = true): Promise<string> {
        let displayValue = property;
        switch (property) {
            case QueueProperty.NAME:
                displayValue = 'Translatable#Name';
                break;
            case QueueProperty.FULLNAME:
                displayValue = 'Translatable#Fullname';
                break;
            case QueueProperty.COMMENT:
                displayValue = 'Translatable#Comment';
                break;
            case KIXObjectProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case KIXObjectProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case KIXObjectProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case KIXObjectProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case QueueProperty.SYSTEM_ADDRESS_ID:
                displayValue = 'Translatable#Sender Address (Email)';
                break;
            case QueueProperty.UNLOCK_TIMEOUT:
                displayValue = short ? 'Translatable#Unlock Timeout (min)' : 'Translatable#Unlock Timeout';
                break;
            case QueueProperty.FOLLOW_UP_ID:
                displayValue = 'Translatable#Follow Up on Tickets possible';
                break;
            case QueueProperty.FOLLOW_UP_LOCK:
                displayValue = 'Translatable#Follow Up Ticket Lock';
                break;
            case QueueProperty.PARENT_ID:
                displayValue = 'Translatable#Parent Queue';
                break;
            case QueueProperty.QUEUE_ID:
            case 'ICON':
                displayValue = 'Translatable#Icon';
                break;
            default:
                displayValue = property;
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue;
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        return;
    }

    public async getDisplayText(
        queue: Queue, property: string, value?: string, translatable: boolean = true
    ): Promise<string> {
        let displayValue = queue[property];

        switch (property) {
            case QueueProperty.QUEUE_ID:
            case 'ICON':
                displayValue = queue.Name;
                break;
            default:
                displayValue = await this.getPropertyValueDisplayText(property, displayValue);
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable: boolean = true
    ): Promise<string> {
        let displayValue = value;
        const objectData = ObjectDataService.getInstance().getObjectData();
        switch (property) {
            case KIXObjectProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID.toString() === value.toString());
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case KIXObjectProperty.CREATE_BY:
            case KIXObjectProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case KIXObjectProperty.CREATE_TIME:
            case KIXObjectProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case QueueProperty.SYSTEM_ADDRESS_ID:
                const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
                    KIXObjectType.SYSTEM_ADDRESS, [value], null, null, true
                ).catch((error) => [] as SystemAddress[]);
                displayValue = systemAddresses && !!systemAddresses.length ?
                    await LabelService.getInstance().getText(systemAddresses[0]) : value;
                break;
            case QueueProperty.FOLLOW_UP_ID:
                const follwoUptypes = await KIXObjectService.loadObjects<FollowUpType>(
                    KIXObjectType.FOLLOW_UP_TYPE, [value], null, null, true
                ).catch((error) => [] as FollowUpType[]);
                displayValue = follwoUptypes && !!follwoUptypes.length ? follwoUptypes[0].Name : value;
                break;
            case QueueProperty.FOLLOW_UP_LOCK:
                displayValue = value === 1 ? 'Translatable#Yes' : 'Translatable#No';
                break;
            case QueueProperty.UNLOCK_TIMEOUT:
                const minuteString = await TranslationService.translate('Translatable#Minutes');
                displayValue = `${value} ${minuteString}`;
                break;
            case QueueProperty.PARENT_ID:
                if (value) {
                    const parentQueue = await KIXObjectService.loadObjects<Queue>(
                        KIXObjectType.QUEUE, [value], null, null, true
                    ).catch((error) => [] as Queue[]);
                    displayValue = parentQueue && !!parentQueue.length ?
                        await LabelService.getInstance().getText(parentQueue[0], true, false) : value;
                }
                break;
            default:
        }

        if (translatable && displayValue) {
            displayValue = await TranslationService.translate(displayValue.toString());
        }

        return displayValue ? displayValue.toString() : '';
    }

    public getDisplayTextClasses(queue: Queue, property: string): string[] {
        return [];
    }

    public getObjectClasses(queue: Queue): string[] {
        return [];
    }

    public async getObjectText(queue: Queue, id?: boolean, title?: boolean): Promise<string> {
        return id && title ? queue.Fullname.replace(/::/g, '/') : queue.Name;
    }

    public getObjectAdditionalText(queue: Queue): string {
        return null;
    }

    public getObjectIcon(queue?: Queue): string | ObjectIcon {
        return new ObjectIcon('Queue', queue.QueueID);
    }

    public async getObjectName(plural?: boolean, translatable: boolean = true): Promise<string> {
        if (translatable) {
            return await TranslationService.translate(
                plural ? 'Translatable#Queues' : 'Translatable#Queue'
            );
        }
        return plural ? 'Queues' : 'Queue';
    }

    public getObjectTooltip(queue: Queue): string {
        return queue.Name;
    }

    public async getIcons(
        queue: Queue, property: string, value?: string | number
    ): Promise<Array<string | ObjectIcon>> {
        if (property === QueueProperty.QUEUE_ID || property === 'ICON') {
            return [new ObjectIcon('Queue', queue.QueueID)];
        }
        if (property === QueueProperty.FOLLOW_UP_ID) {
            return [new ObjectIcon('FollowUpType', value)];
        }
        return null;
    }

}
