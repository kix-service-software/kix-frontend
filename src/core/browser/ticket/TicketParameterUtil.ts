import { PendingTimeFormValue } from ".";
import {
    TicketProperty, ArticleProperty, Contact,
    DateTimeUtil, Attachment, Customer, Ticket,
    Lock, KIXObjectType, SenderType,
    KIXObjectLoadingOptions, FilterCriteria, FilterDataType, FilterType
} from "../../model";
import { ContextService } from "../context";
import { KIXObjectService } from "../kix";
import { SearchOperator } from "../SearchOperator";
import { BrowserUtil } from "../BrowserUtil";

export class TicketParameterUtil {

    public static async prepareValue(
        property: string, value: any, forUpdate: boolean = false
    ): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];
        if (value) {
            // TODO: value should always be the ID of the object
            if (property === TicketProperty.STATE_ID) {
                const pendingValue = (value as PendingTimeFormValue);
                if (pendingValue) {
                    parameter.push([property, pendingValue.stateId]);
                    if (pendingValue.pending) {
                        const pendingTime = DateTimeUtil.getKIXDateTimeString(pendingValue.pendingDate);
                        parameter.push([TicketProperty.PENDING_TIME, pendingTime]);
                    }
                }
            } else if (property === TicketProperty.CUSTOMER_USER_ID) {
                const contact = (value as Contact);
                parameter.push([property, contact.ContactID]);
            } else if (property === TicketProperty.CUSTOMER_ID) {
                const customer = (value as Customer);
                parameter.push([property, customer.CustomerID]);
            } else if (property === TicketProperty.TITLE) {
                parameter.push([TicketProperty.TITLE, value]);
                if (!forUpdate) {
                    parameter.push([ArticleProperty.SUBJECT, value]);
                }
            } else if (property === ArticleProperty.SUBJECT) {
                parameter.push([TicketProperty.TITLE, value]);
                parameter.push([ArticleProperty.SUBJECT, value]);
            } else if (property === ArticleProperty.BODY) {
                parameter.push([ArticleProperty.BODY, value]);
            } else if (property === ArticleProperty.ATTACHMENTS) {
                if (value) {
                    const attachments = await TicketParameterUtil.prepareAttachments(value);
                    parameter.push([ArticleProperty.ATTACHMENTS, attachments]);
                }
            } else if (property === TicketProperty.OWNER_ID) {
                parameter.push([property, value]);
                if (forUpdate) {
                    const context = ContextService.getInstance().getActiveContext();
                    if (context) {
                        const ticket = context.getObject<Ticket>();

                        const locks = await KIXObjectService.loadObjects<Lock>(
                            KIXObjectType.LOCK, null
                        );

                        const lock = locks.find((tl) => tl.Name === 'lock');
                        if (ticket && lock && ticket[property] !== value) {
                            parameter.push([TicketProperty.LOCK_ID, lock.ID]);
                        }
                    }
                }
            } else {
                parameter.push([property, value]);
            }

        } else {
            parameter.push([property, value]);
        }
        return parameter;
    }

    public static async getPredefinedParameter(forUpdate: boolean = false): Promise<Array<[string, any]>> {
        const parameter: Array<[string, any]> = [];

        const loadingOptionsSenderType = new KIXObjectLoadingOptions(null, [
            new FilterCriteria('Name', SearchOperator.EQUALS, FilterDataType.STRING, FilterType.AND, 'agent')
        ]);
        const senderTypes = await KIXObjectService.loadObjects<SenderType>(
            KIXObjectType.SENDER_TYPE, null, loadingOptionsSenderType
        );

        if (forUpdate) {
            parameter.push([ArticleProperty.SENDER_TYPE_ID, senderTypes[0].ID]);
        }

        return parameter;
    }

    private static async prepareAttachments(files: File[]): Promise<Attachment[]> {
        const attachments = [];
        for (const f of files) {
            const attachment = new Attachment();
            attachment.ContentType = f.type !== '' ? f.type : 'text';
            attachment.Filename = f.name;
            attachment.Content = await BrowserUtil.readFile(f);
            attachments.push(attachment);
        }
        return attachments;
    }
}
