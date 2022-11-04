/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { FormFieldConfiguration } from '../../../../../model/configuration/FormFieldConfiguration';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { Ticket } from '../../../model/Ticket';
import { TicketProperty } from '../../../model/TicketProperty';
import { ArticleFormValue } from './form-values/ArticleFormValue';
import { ObjectFormValue } from '../../../../object-forms/model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../../../object-forms/model/FormValues/SelectObjectFormValue';
import { ObjectFormValueMapper } from '../../../../object-forms/model/ObjectFormValueMapper';
import { TicketStateFormValue } from './form-values/TicketStateFormValue';
import { OrganisationObjectFormValue } from './form-values/OrganisationObjectFormValue';
import { TicketService } from '../TicketService';
import { QueueFormValue } from './form-values/QueueFormValue';
import { ContactObjectFormValue } from './form-values/ContactObjectFormValue';
import { UserObjectFormValue } from './form-values/UserObjectFormValue';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';

export class TicketObjectFormValueMapper extends ObjectFormValueMapper<Ticket> {

    public async mapObjectValues(ticket: Ticket): Promise<void> {
        await this.loadSourceObject();

        await super.mapObjectValues(ticket);

        for (const property in ticket) {
            if (!Object.prototype.hasOwnProperty.call(ticket, property)) {
                continue;
            }

            switch (property) {
                case TicketProperty.TITLE:
                    this.formValues.push(new ObjectFormValue(property, ticket, this, null));
                    break;
                case TicketProperty.OWNER_ID:
                case TicketProperty.RESPONSIBLE_ID:
                    this.formValues.push(new UserObjectFormValue(property, ticket, this, null));
                    break;
                case TicketProperty.CONTACT_ID:
                    this.formValues.push(new ContactObjectFormValue(property, ticket, this, null));
                    break;
                case TicketProperty.QUEUE_ID:
                    this.formValues.push(new QueueFormValue(property, ticket, this, null));
                    break;
                case TicketProperty.ORGANISATION_ID:
                    this.formValues.push(new OrganisationObjectFormValue(property, ticket, this, null));
                    break;
                case TicketProperty.STATE_ID:
                    this.formValues.push(new TicketStateFormValue(property, ticket, this, null));
                    break;
                case TicketProperty.ARTICLES:
                    this.formValues.push(new ArticleFormValue(property, ticket, this, null));
                    break;
                case TicketProperty.TYPE_ID:
                case TicketProperty.PRIORITY_ID:
                    const selectFormValue = new SelectObjectFormValue(property, ticket, this, null);
                    const objectType = await TicketService.getInstance().getObjectTypeForProperty(property);
                    selectFormValue.objectType = objectType;
                    this.formValues.push(selectFormValue);
                    break;
                default:
            }
        }
    }

    protected async mapFormField(field: FormFieldConfiguration, ticket: Ticket): Promise<void> {
        if (field.property === 'USE_REFERENCED_ATTACHMENTS') {
            if (field.defaultValue?.value) {
                const context = ContextService.getInstance().getActiveContext();
                context?.setAdditionalInformation('USE_REFERENCED_ATTACHMENTS', true);
            }
        } else {
            await super.mapFormField(field, ticket);
        }
    }

    protected async createFormValue(property: string, ticket: Ticket): Promise<ObjectFormValue> {
        let formValue: ObjectFormValue;
        if (this.isArticleProperty(property)) {
            const articleFormValue = this.formValues.find((fv) => fv.property === TicketProperty.ARTICLES);
            formValue = articleFormValue?.formValues?.find((fv) => fv.property === property);
        }

        if (!formValue) {
            formValue = await super.createFormValue(property, ticket);
        }

        return formValue;
    }

    private isArticleProperty(property: string): boolean {
        const articleProperty = Object.keys(ArticleProperty).map((p) => ArticleProperty[p]);
        return articleProperty.some((p) => p === property);
    }

    private async loadSourceObject(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const sourceObjectId = context?.getAdditionalInformation('REFERENCED_SOURCE_OBJECT_ID');
        if (sourceObjectId) {
            const loadingOptions = new KIXObjectLoadingOptions();
            loadingOptions.includes = [KIXObjectProperty.DYNAMIC_FIELDS, TicketProperty.ARTICLES];
            const tickets = await KIXObjectService.loadObjects<Ticket>(
                KIXObjectType.TICKET, [sourceObjectId], loadingOptions
            ).catch(() => null);

            if (tickets?.length) {
                this.sourceObject = tickets[0];
            }
        }
    }

}