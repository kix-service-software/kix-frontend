/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from '../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../model/kix/KIXObjectType';
import { NotificationProperty } from './NotificationProperty';
import { ArticleProperty } from '../../ticket/model/ArticleProperty';

export class Notification extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType = KIXObjectType.NOTIFICATION;

    public Data: {};

    public ID: number;

    public Message: {};

    public Name: string;

    // data properties
    public Filter: Map<string, string[] | number[]>;
    public Events: string[];
    public VisibleForAgent: boolean;
    public VisibleForAgentTooltip: string;
    public Recipients: string[];
    public RecipientAgents: number[];
    public RecipientEmail: string[];
    public RecipientRoles: number[];
    public RecipientSubject: boolean;
    public SendOnOutOfOffice: boolean;
    public OncePerDay: boolean;
    public CreateArticle: boolean;

    public constructor(notification?: Notification) {
        super(notification);
        if (notification) {
            this.ID = notification.ID;
            this.ObjectId = this.ID;
            this.Name = notification.Name;
            this.Data = notification.Data;
            this.Message = notification.Message;

            if (notification.Data) {
                this.Filter = new Map();
                for (const key in notification.Data) {
                    if (key && Array.isArray(notification.Data[key])) {
                        const value = notification.Data[key];
                        switch (key) {
                            case NotificationProperty.DATA_VISIBLE_FOR_AGENT:
                                this.VisibleForAgent = Boolean(Number(value[0]));
                                break;
                            case NotificationProperty.DATA_VISIBLE_FOR_AGENT_TOOLTIP:
                                this.VisibleForAgentTooltip = value[0];
                                break;
                            case NotificationProperty.DATA_RECIPIENTS:
                                this.Recipients = value;
                                break;
                            case NotificationProperty.DATA_EVENTS:
                                this.Events = value;
                                break;
                            case NotificationProperty.DATA_RECIPIENT_AGENTS:
                                this.RecipientAgents = value.map((v) => Number(v));
                                break;
                            case NotificationProperty.DATA_RECIPIENT_EMAIL:
                                this.RecipientEmail = value[0].split(/,\s?/);
                                break;
                            case NotificationProperty.DATA_RECIPIENT_ROLES:
                                this.RecipientRoles = value.map((v) => Number(v));
                                break;
                            case NotificationProperty.DATA_RECIPIENT_SUBJECT:
                                this.RecipientSubject = Boolean(Number(value[0]));
                                break;
                            case NotificationProperty.DATA_SEND_DESPITE_OOO:
                                this.SendOnOutOfOffice = Boolean(Number(value[0]));
                                break;
                            case NotificationProperty.DATA_SEND_ONCE_A_DAY:
                                this.OncePerDay = Boolean(Number(value[0]));
                                break;
                            case NotificationProperty.DATA_CREATE_ARTICLE:
                                this.CreateArticle = Boolean(Number(value[0]));
                                break;
                            default:
                                if (key.match(/(Ticket|Article)::/)) {
                                    let property = key.replace('Ticket::', '');
                                    property = property.replace('Article::', '');
                                    let newValue;
                                    if (this.isStringProperty(property)) {
                                        newValue = value[0];
                                    } else {
                                        newValue = value.map((v) => !isNaN(Number(v)) ? Number(v) : v);
                                    }
                                    this.Filter.set(property, newValue);
                                }
                        }
                    }
                }
            }

        }
    }

    private isStringProperty(property: string): boolean {
        return property === ArticleProperty.FROM
            || property === ArticleProperty.TO
            || property === ArticleProperty.CC
            || property === ArticleProperty.BCC
            || property === ArticleProperty.SUBJECT
            || property === ArticleProperty.BODY;
    }

}
