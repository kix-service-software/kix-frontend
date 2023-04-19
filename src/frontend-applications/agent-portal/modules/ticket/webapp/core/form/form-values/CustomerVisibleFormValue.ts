/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../../model/KIXObjectLoadingOptions';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { KIXObjectService } from '../../../../../base-components/webapp/core/KIXObjectService';
import { Contact } from '../../../../../customer/model/Contact';
import { Organisation } from '../../../../../customer/model/Organisation';
import { OrganisationProperty } from '../../../../../customer/model/OrganisationProperty';
import { BooleanFormValue } from '../../../../../object-forms/model/FormValues/BooleanFormValue';
import { Article } from '../../../../model/Article';
import { ArticleLoadingOptions } from '../../../../model/ArticleLoadingOptions';
import { ArticleProperty } from '../../../../model/ArticleProperty';
import { Ticket } from '../../../../model/Ticket';
import { TicketProperty } from '../../../../model/TicketProperty';
import addrparser from 'address-rfc2822';
import { FormContext } from '../../../../../../model/configuration/FormContext';

export class CustomerVisibleFormValue extends BooleanFormValue {

    private ticketBindingIds: string[] = [];
    private articleBindingIds: string[] = [];
    private initialReadonly: boolean;

    public async initFormValue(): Promise<void> {
        await super.initFormValue();
        const context = ContextService.getInstance().getActiveContext();
        const refArticleId = context?.getAdditionalInformation(ArticleProperty.REFERENCED_ARTICLE_ID);
        if (refArticleId) {
            const refTicketId = context?.getObjectId();
            const refArticle = await this.loadReferencedArticle(Number(refTicketId), refArticleId);
            if (refArticle) {
                this.value = refArticle?.CustomerVisible;
            }
        }

        const ticket = this.objectValueMapper?.object ? this.objectValueMapper.object as Ticket : null;
        if (ticket?.Articles?.length) {
            this.ticketBindingIds.push(
                ticket.addBinding(TicketProperty.ORGANISATION_ID, async () => {
                    this.setVisibleIfNecessary();
                })
            );
            this.articleBindingIds.push(
                ticket.Articles[0].addBinding(ArticleProperty.TO, async () => {
                    this.setVisibleIfNecessary();
                }),
                ticket.Articles[0].addBinding(ArticleProperty.CC, async () => {
                    this.setVisibleIfNecessary();
                }),
                ticket.Articles[0].addBinding(ArticleProperty.BCC, async () => {
                    this.setVisibleIfNecessary();
                }),
                ticket.Articles[0].addBinding(ArticleProperty.CHANNEL_ID, async () => {
                    this.setVisibleIfNecessary();
                })
            );
        }

        // remember inital readonly (do not use possible new value from setVisibleIfNecessary)
        this.initialReadonly = this.readonly;

        return this.setVisibleIfNecessary();
    }

    public setInitialState(): void {
        super.setInitialState();
        this.initialState.set('readonly', this.initialReadonly);
    }

    public destroy(): void {
        if (this.ticketBindingIds?.length && this.objectValueMapper?.object) {
            const ticket = this.objectValueMapper.object as Ticket;
            ticket.removeBindings(this.ticketBindingIds);
            if (this.articleBindingIds?.length && ticket.Articles?.length) {
                ticket.Articles[0].removeBindings(this.articleBindingIds);
            }
        }
        super.destroy();
    }

    private async loadReferencedArticle(refTicketId: number, refArticleId: number): Promise<Article> {
        let article: Article;
        if (refArticleId && refTicketId) {
            const articles = await KIXObjectService.loadObjects<Article>(
                KIXObjectType.ARTICLE, [refArticleId], null,
                new ArticleLoadingOptions(refTicketId), true
            ).catch(() => [] as Article[]);
            article = articles.find((a) => a.ArticleID === refArticleId);
        }
        return article;
    }

    // if email and contacts of organisation are also recipients, article should be visible
    private async setVisibleIfNecessary(): Promise<void> {
        const channelValue = this.objectValueMapper?.findFormValue(ArticleProperty.CHANNEL_ID);
        const channel = channelValue?.value ? Array.isArray(channelValue.value) ?
            Number(channelValue.value[0]) : Number(channelValue.value) : null;
        const organisationId = this.objectValueMapper?.object ?
            (this.objectValueMapper.object as Ticket).OrganisationID : null;
        if (channel === 2 && organisationId) {
            // check for unknown (new) contact/organisation
            const isKnownOrganisation = organisationId?.toString().match(/^\d+$/);
            const contacts = isKnownOrganisation ? await this.getContactsOfOrganisation(organisationId) :
                [new Contact({ Email: organisationId } as any as Contact)];
            if (contacts?.length) {
                // form context new means contact = To, else check set recipients
                const arcticleShouldBeCustomerVisible = this.objectValueMapper.formContext === FormContext.NEW ||
                    await this.checkAddresses(contacts);
                if (arcticleShouldBeCustomerVisible) {
                    this.value = true;
                    this.readonly = true;
                } else {
                    // reset - if not necessary
                    this.readonly = this.initialState.get('readonly');
                }
            } else {
                // reset - if no contacts
                this.readonly = this.initialState.get('readonly');
            }
        } else {
            // reset - if not email or no organisation is set
            this.readonly = this.initialState.get('readonly');
        }
    }

    private async getContactsOfOrganisation(orgId: number): Promise<Contact[]> {
        let contacts: Contact[];
        if (orgId) {
            const organisations = await KIXObjectService.loadObjects<Organisation>(
                KIXObjectType.ORGANISATION, [orgId],
                new KIXObjectLoadingOptions(
                    null, null, null, [OrganisationProperty.CONTACTS]
                ), null, true
            ).catch(() => [] as Organisation[]);
            contacts = organisations && organisations.length ? organisations[0].Contacts : null;
        }
        return contacts;
    }

    private async checkAddresses(contacts: Contact[]): Promise<boolean> {
        const formAdresses: string[] = [];
        for (const property of [ArticleProperty.TO, ArticleProperty.CC, ArticleProperty.BCC]) {
            const value = this.objectValueMapper?.findFormValue(property);
            if (value && Array.isArray(value.value)) {
                value.value.forEach((v) => {
                    if (v) {
                        const mailAddresses = this.parseAddresses(v);
                        if (mailAddresses?.length) {
                            formAdresses.push(...mailAddresses);
                        }
                    }
                });
            }
        }
        if (!formAdresses.length) {
            return false;
        }

        const contactAdresses: string[] = [];
        contacts.forEach((c) => {
            const mailAddresses = this.parseAddresses(c.Email);
            if (mailAddresses?.length) {
                contactAdresses.push(...mailAddresses);
            }
        });
        if (!contactAdresses.length) {
            return false;
        }

        return contactAdresses.some((ca) => formAdresses.includes(ca));
    }

    private parseAddresses(value: string): string[] {
        const emailAddresses = [];
        try {
            const parseResult = addrparser.parse(value);
            for (const address of parseResult) {
                if (address.phrase && address.phrase !== address.address) {
                    emailAddresses.push(`"${address.phrase}" <${address.address}>`);
                } else {
                    emailAddresses.push(address.address);
                }
            }
        } catch (error) {
            // ignore probably wrong value
        }
        return emailAddresses;
    }
}