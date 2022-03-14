/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { FormInputComponent } from '../../../../base-components/webapp/core/FormInputComponent';
import { ArticleProperty } from '../../../model/ArticleProperty';
import { TicketProperty } from '../../../model/TicketProperty';
import { Organisation } from '../../../../customer/model/Organisation';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { OrganisationProperty } from '../../../../customer/model/OrganisationProperty';
import { Contact } from '../../../../customer/model/Contact';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { Ticket } from '../../../model/Ticket';
import { FormInstance } from '../../../../base-components/webapp/core/FormInstance';

class Component extends FormInputComponent<any, ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        await this.setCurrentValue();
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
    }

    public async setCurrentValue(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const formInstance = await context?.getFormManager()?.getFormInstance();
        const value = formInstance.getFormFieldValue<number>(this.state.field?.instanceId);
        if (value) {
            if (Array.isArray(value.value)) {
                this.state.checked = Boolean(value.value[0]);
            } else {
                // handle also '0' as false
                this.state.checked = !isNaN(Number(value.value)) ? Boolean(Number(value.value)) : Boolean(value.value);
            }
        }
    }

    public checkboxClicked(): void {
        this.state.checked = !this.state.checked;
        super.provideValue(this.state.checked);
    }

    private async checkValues(): Promise<boolean> {
        let setCheckAndDisabled = false;
        if (this.state.formId) {
            const context = ContextService.getInstance().getActiveContext();
            const formInstance = await context?.getFormManager()?.getFormInstance();
            if (formInstance) {
                const channelValue = await formInstance.getFormFieldValueByProperty<number>(ArticleProperty.CHANNEL_ID);
                if (channelValue && channelValue.value && channelValue.value === 2) {
                    const organisation = await this.getOrganisation(formInstance);
                    if (organisation && Array.isArray(organisation.Contacts) && organisation.Contacts.length) {
                        setCheckAndDisabled = await this.checkAddresses(formInstance, organisation.Contacts);
                    }
                }
            }
        }
        return setCheckAndDisabled;
    }

    private async getOrganisation(formInstance: FormInstance): Promise<Organisation> {
        let orgId;
        if (formInstance.getObjectType() === KIXObjectType.ARTICLE) {
            const context = ContextService.getInstance().getActiveContext();
            if (context) {
                const ticket = await context.getObject<Ticket>(KIXObjectType.TICKET);
                if (ticket) {
                    orgId = ticket.OrganisationID;
                }
            }
        } else {
            const organisationValue = await formInstance.getFormFieldValueByProperty<number>(
                TicketProperty.ORGANISATION_ID
            );
            orgId = organisationValue ? organisationValue.value : null;
        }
        let organisation: Organisation;
        if (orgId) {
            const organisations = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, [orgId],
                new KIXObjectLoadingOptions(
                    null, null, null, [OrganisationProperty.CONTACTS]
                ), null, true
            ).catch(() => [] as Organisation[]);
            organisation = organisations && organisations.length ? organisations[0] : null;
        }
        return organisation;
    }

    private async checkAddresses(formInstance: FormInstance, contacts: Contact[]): Promise<boolean> {
        const addresses: string[] = [];
        for (const property of [ArticleProperty.TO, ArticleProperty.CC, ArticleProperty.BCC]) {
            const value = await formInstance.getFormFieldValueByProperty<string[]>(property);
            if (value && Array.isArray(value.value)) {
                value.value.forEach((v) => {
                    if (v) {
                        const plainMail = v.replace(/.+ <(.+)>/, '$1');
                        if (!addresses.some((a) => a === plainMail)) {
                            addresses.push(plainMail);
                        }
                    }
                });
            }
        }
        return contacts.some((c) => {
            const plainMail = c.Email.replace(/.+ <(.+)>/, '$1');
            return addresses.indexOf(plainMail) >= 0;
        });
    }
}

module.exports = Component;
