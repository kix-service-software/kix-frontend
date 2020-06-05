/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractJobFormManager } from './AbstractJobFormManager';
import { Job } from '../../model/Job';
import { JobProperty } from '../../model/JobProperty';
import { ArticleProperty } from '../../../ticket/model/ArticleProperty';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { ContextType } from '../../../../model/ContextType';
import { JobService } from '.';
import { TicketJobFilterManager } from './TicketJobFilterManager';
import { TicketProperty } from '../../../ticket/model/TicketProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';
import { FormContext } from '../../../../model/configuration/FormContext';

export class TicketJobFormManager extends AbstractJobFormManager {

    public filterManager = TicketJobFilterManager.getInstance();

    public async getValue(property: string, value: any, job: Job, formContext: FormContext): Promise<any> {
        switch (property) {
            case JobProperty.FILTER:
                if (job && job.Filter && formContext === FormContext.EDIT) {
                    const articleProperty = [
                        ArticleProperty.SENDER_TYPE_ID, ArticleProperty.CHANNEL_ID, ArticleProperty.TO,
                        ArticleProperty.CC, ArticleProperty.FROM, ArticleProperty.SUBJECT, ArticleProperty.BODY
                    ];
                    let hasArticleEvent = false;
                    value = {};
                    const context = ContextService.getInstance().getActiveContext();
                    if (context && context.getDescriptor().contextType === ContextType.DIALOG) {
                        const selectedEvents = context.getAdditionalInformation(JobProperty.EXEC_PLAN_EVENTS);
                        hasArticleEvent = selectedEvents
                            ? await JobService.getInstance().hasArticleEvent(selectedEvents)
                            : false;
                    }
                    for (const filterProperty in job.Filter) {
                        if (filterProperty && (hasArticleEvent || !articleProperty.some((p) => filterProperty === p))) {
                            value[filterProperty] = job.Filter[filterProperty];
                        }
                    }
                }
                break;
            default:
                value = await super.getValue(property, value, job, formContext);
        }
        return value;
    }

    public async prepareCreateValue(property: string, value: any): Promise<Array<[string, any]>> {
        switch (property) {
            case JobProperty.FILTER:
                if (value) {
                    const newValue = {};
                    for (const valueProperty in value) {
                        if (valueProperty) {
                            let newValueProperty = valueProperty;

                            switch (valueProperty) {
                                case TicketProperty.TYPE_ID:
                                case TicketProperty.STATE_ID:
                                case TicketProperty.PRIORITY_ID:
                                case TicketProperty.QUEUE_ID:
                                case TicketProperty.LOCK_ID:
                                case TicketProperty.ORGANISATION_ID:
                                case TicketProperty.CONTACT_ID:
                                case TicketProperty.OWNER_ID:
                                case TicketProperty.RESPONSIBLE_ID:
                                    if (!newValueProperty.match(/^Ticket::/)) {
                                        newValueProperty = 'Ticket::' + newValueProperty;
                                    }
                                    break;
                                case ArticleProperty.SENDER_TYPE_ID:
                                case ArticleProperty.CHANNEL_ID:
                                case ArticleProperty.TO:
                                case ArticleProperty.CC:
                                case ArticleProperty.FROM:
                                case ArticleProperty.SUBJECT:
                                case ArticleProperty.BODY:
                                    if (!newValueProperty.match(/^Article::/)) {
                                        newValueProperty = 'Article::' + newValueProperty;
                                    }
                                    break;
                                default:
                                    if (
                                        newValueProperty.match(new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`))
                                    ) {
                                        newValueProperty = newValueProperty.replace(
                                            new RegExp(`${KIXObjectProperty.DYNAMIC_FIELDS}?\.(.+)`),
                                            'Ticket::DynamicField_$1'
                                        );
                                    }
                            }

                            newValue[newValueProperty] = value[valueProperty];
                        }
                    }
                    value = newValue;
                }
                break;
            default:

        }
        return [[property, value]];
    }

}
