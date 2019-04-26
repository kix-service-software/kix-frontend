import { ILabelProvider } from "../ILabelProvider";
import { KIXObjectType, ObjectIcon, DateTimeUtil, User, Queue, QueueProperty, SystemAddress } from "../../model";
import { TranslationService } from "../i18n/TranslationService";
import { ObjectDataService } from "../ObjectDataService";
import { KIXObjectService } from "../kix";

export class QueueLabelProvider implements ILabelProvider<Queue> {

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
            case QueueProperty.CREATE_BY:
                displayValue = 'Translatable#Created by';
                break;
            case QueueProperty.CREATE_TIME:
                displayValue = 'Translatable#Created at';
                break;
            case QueueProperty.CHANGE_BY:
                displayValue = 'Translatable#Changed by';
                break;
            case QueueProperty.CHANGE_TIME:
                displayValue = 'Translatable#Changed at';
                break;
            case QueueProperty.VALID_ID:
                displayValue = 'Translatable#Validity';
                break;
            case QueueProperty.SYSTEM_ADDRESS_ID:
                displayValue = 'Translatable#Email address';
                break;
            case QueueProperty.UNLOCK_TIMEOUT:
                displayValue = 'Translatable#Unlock Timeout (min)';
                break;
            case QueueProperty.FOLLOW_UP_ID:
                displayValue = 'Translatable#Follow Up Possible';
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
            case QueueProperty.VALID_ID:
                const valid = objectData.validObjects.find((v) => v.ID.toString() === value.toString());
                if (valid) {
                    displayValue = valid.Name;
                }
                break;
            case QueueProperty.CREATE_BY:
            case QueueProperty.CHANGE_BY:
                const users = await KIXObjectService.loadObjects<User>(
                    KIXObjectType.USER, [value], null, null, true
                ).catch((error) => [] as User[]);
                displayValue = users && !!users.length ? users[0].UserFullname : value;
                break;
            case QueueProperty.CREATE_TIME:
            case QueueProperty.CHANGE_TIME:
                displayValue = await DateTimeUtil.getLocalDateTimeString(displayValue);
                break;
            case QueueProperty.SYSTEM_ADDRESS_ID:
                const systemAddresses = await KIXObjectService.loadObjects<SystemAddress>(
                    KIXObjectType.SYSTEM_ADDRESS, [value], null, null, true
                ).catch((error) => [] as SystemAddress[]);
                displayValue = systemAddresses && !!systemAddresses.length ?
                    `${systemAddresses[0].Realname} <${systemAddresses[0].Name}>` : value;
                break;
            // case QueueProperty.FOLLOW_UP_ID:
            //     const follwoUptypes = await KIXObjectService.loadObjects<FollowUpType>(
            //         KIXObjectType.FOLLOW_UP_TYPE, [value], null, null, true
            //     ).catch((error) => [] as FollowUpType[]);
            //     displayValue = follwoUptypes && !!follwoUptypes.length ? follwoUptypes[0].Name : value;
            //     break;
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
        return queue.Name;
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
            return [new ObjectIcon('Priority', queue.QueueID)];
        }
        return null;
    }

}
