/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { ContextUIEvent } from "../../../../base-components/webapp/core/ContextUIEvent";

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
        this.loadOrganisations();
    }

    public setFilteredObjectList(objectType: KIXObjectType, filteredObjectList: KIXObject[]) {
        super.setFilteredObjectList(objectType, filteredObjectList);

        if (objectType === KIXObjectType.ORGANISATION) {
            const isOrganisationDepending = this.getAdditionalInformation(
                OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING
            );
            if (isOrganisationDepending) {
                this.loadContacts();
            }
        }
    }

    private async loadOrganisations(): Promise<void> {
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS, KIXObjectType.ORGANISATION);
        const organisations = await KIXObjectService.loadObjects(
            KIXObjectType.ORGANISATION, null, null, null, false
        ).catch((error) => []);

        this.setObjectList(KIXObjectType.ORGANISATION, organisations);
        super.setFilteredObjectList(KIXObjectType.ORGANISATION, organisations);

        const isOrganisationDepending = this.getAdditionalInformation(
            OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING
        );
        if (isOrganisationDepending) {
            await this.loadContacts();
        }
    }

    public async loadContacts(): Promise<void> {
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS, KIXObjectType.CONTACT);
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

        const loadingOptions = new KIXObjectLoadingOptions(filter, null, null, [ContactProperty.USER]);
        const contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, null, loadingOptions);
        this.setObjectList(KIXObjectType.CONTACT, contacts);
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS_FINISHED, KIXObjectType.CONTACT);
    }

    public reset(): void {
        super.reset();
        this.initContext();
    }

    public reloadObjectList(objectType: KIXObjectType | string): Promise<void> {
        if (objectType === KIXObjectType.ORGANISATION) {
            return this.loadOrganisations();
        } else if (objectType === KIXObjectType.CONTACT) {
            return this.loadContacts();
        }
    }

}

export enum OrganisationAdditionalInformationKeys {

    ORGANISATION_DEPENDING = 'ORGANISATION_DEPENDING'

}
