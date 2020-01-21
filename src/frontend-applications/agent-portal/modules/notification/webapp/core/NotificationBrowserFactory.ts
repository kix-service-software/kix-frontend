/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { NotificationFilterManager } from "./NotificationFilterManager";
import { KIXObjectFactory } from "../../../../modules/base-components/webapp/core/KIXObjectFactory";
import { NotificationProperty } from "../../model/NotificationProperty";
import { ArticleProperty } from "../../../ticket/model/ArticleProperty";
import { Notification } from "../../model/Notification";
import { KIXObjectProperty } from "../../../../model/kix/KIXObjectProperty";

export class NotificationBrowserFactory extends KIXObjectFactory<Notification> {

    private static INSTANCE: NotificationBrowserFactory;

    public static getInstance(): NotificationBrowserFactory {
        if (!NotificationBrowserFactory.INSTANCE) {
            NotificationBrowserFactory.INSTANCE = new NotificationBrowserFactory();
        }
        return NotificationBrowserFactory.INSTANCE;
    }

    private constructor() {
        super();
    }

    public async create(notification: Notification): Promise<Notification> {
        const newNotification = new Notification(notification);

        if (newNotification.Data) {
            const filterProperties = await new NotificationFilterManager().getProperties();
            newNotification.Filter = new Map();
            for (const key in newNotification.Data) {
                if (key && Array.isArray(newNotification.Data[key])) {
                    const value = newNotification.Data[key];
                    switch (key) {
                        case NotificationProperty.DATA_VISIBLE_FOR_AGENT:
                            newNotification.VisibleForAgent = Boolean(Number(value[0]));
                            break;
                        case NotificationProperty.DATA_VISIBLE_FOR_AGENT_TOOLTIP:
                            newNotification.VisibleForAgentTooltip = value[0];
                            break;
                        case NotificationProperty.DATA_RECIPIENTS:
                            newNotification.Recipients = value;
                            break;
                        case NotificationProperty.DATA_EVENTS:
                            newNotification.Events = value;
                            break;
                        case NotificationProperty.DATA_RECIPIENT_AGENTS:
                            newNotification.RecipientAgents = value.map((v) => Number(v));
                            break;
                        case NotificationProperty.DATA_RECIPIENT_EMAIL:
                            newNotification.RecipientEmail = value[0].split(/,\s?/);
                            break;
                        case NotificationProperty.DATA_RECIPIENT_ROLES:
                            newNotification.RecipientRoles = value.map((v) => Number(v));
                            break;
                        case NotificationProperty.DATA_RECIPIENT_SUBJECT:
                            newNotification.RecipientSubject = Boolean(Number(value[0]));
                            break;
                        case NotificationProperty.DATA_SEND_DESPITE_OOO:
                            newNotification.SendOnOutOfOffice = Boolean(Number(value[0]));
                            break;
                        case NotificationProperty.DATA_SEND_ONCE_A_DAY:
                            newNotification.OncePerDay = Boolean(Number(value[0]));
                            break;
                        case NotificationProperty.DATA_CREATE_ARTICLE:
                            newNotification.CreateArticle = Boolean(Number(value[0]));
                            break;
                        default:
                            let property = key.replace('Ticket::', '');
                            property = property.replace('Article::', '');
                            property = property.replace(
                                /^DynamicField_(.+)$/, `${KIXObjectProperty.DYNAMIC_FIELDS}.$1`
                            );
                            if (filterProperties.some((p) => p[0] === property)) {
                                let newValue;
                                if (this.isStringProperty(property)) {
                                    newValue = value[0];
                                } else {
                                    newValue = value.map((v) => !isNaN(Number(v)) ? Number(v) : v);
                                }
                                newNotification.Filter.set(property, newValue);
                            }
                    }
                }
            }
        }
        return newNotification;
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
