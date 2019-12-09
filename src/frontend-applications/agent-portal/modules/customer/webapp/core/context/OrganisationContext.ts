/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../model/Context";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { KIXObject } from "../../../../../model/kix/KIXObject";
import { EventService } from "../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../modules/base-components/webapp/core/ApplicationEvent";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";
import { FilterCriteria } from "../../../../../model/FilterCriteria";
import { ContactProperty } from "../../../model/ContactProperty";
import { SearchOperator } from "../../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../../model/FilterDataType";
import { FilterType } from "../../../../../model/FilterType";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { Contact } from "../../../model/Contact";

export class OrganisationContext extends Context {

    public static CONTEXT_ID: string = 'organisations';

    public getIcon(): string {
        return 'kix-icon-organisation';
    }

    public async getDisplayText(): Promise<string> {
        return await TranslationService.translate('Translatable#Customer Dashboard');
    }

    public async initContext(): Promise<void> {
        this.setAdditionalInformation(OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING, true);
        await this.loadOrganisations();
    }

    public setFilteredObjectList(objectType: KIXObjectType, filteredObjectList: KIXObject[]) {
        super.setFilteredObjectList(objectType, filteredObjectList);

        if (objectType === KIXObjectType.ORGANISATION) {
            this.loadContacts();
        }
    }

    private async loadOrganisations(): Promise<void> {
        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Load Organisations'
            });
        }, 500);

        const organisations = await KIXObjectService.loadObjects(
            KIXObjectType.ORGANISATION, null, null, null, false
        ).catch((error) => []);

        window.clearTimeout(timeout);

        this.setObjectList(KIXObjectType.ORGANISATION, organisations);

        const isOrganisationDepending = this.getAdditionalInformation(
            OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING
        );
        if (isOrganisationDepending) {
            await this.loadContacts();
        }

        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
    }

    public async loadContacts(): Promise<void> {
        const filter = [];

        const organisations = this.getFilteredObjectList(KIXObjectType.ORGANISATION);
        const isOrganisationDepending = this.getAdditionalInformation(
            OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING
        );
        if (organisations && isOrganisationDepending) {
            const organisationIds = organisations.map((o) => Number(o.ObjectId));
            if (organisationIds && organisationIds.length) {
                filter.push(new FilterCriteria(
                    ContactProperty.ORGANISATION_IDS, SearchOperator.IN,
                    FilterDataType.NUMERIC, FilterType.AND, organisationIds
                ));
            }
        }

        const loadingOptions = new KIXObjectLoadingOptions(filter);
        const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, null, loadingOptions);
        this.setObjectList(KIXObjectType.CONTACT, contacts);
    }

    public reset(): void {
        super.reset();
        this.initContext();
    }

}

export enum OrganisationAdditionalInformationKeys {

    ORGANISATION_DEPENDING = 'ORGANISATION_DEPENDING'

}
