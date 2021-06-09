/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { EventService } from '../../../../../modules/base-components/webapp/core/EventService';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { ContactProperty } from '../../../model/ContactProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { Contact } from '../../../model/Contact';
import { ContextUIEvent } from '../../../../base-components/webapp/core/ContextUIEvent';
import { OrganisationService } from '../OrganisationService';
import { ContactService } from '../ContactService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';

export class OrganisationContext extends Context {

    public static CONTEXT_ID: string = 'organisations';

    public filterValue: string;

    public async initContext(urlParams: URLSearchParams): Promise<void> {
        if (urlParams) {
            if (urlParams.has('dependent')) {
                this.setAdditionalInformation(
                    OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING,
                    Boolean(urlParams.get('dependent'))
                );
            }

            if (urlParams.has('filter')) {
                this.filterValue = decodeURI(urlParams.get('filter'));
            }
        } else {
            this.setAdditionalInformation(OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING, false);
        }

    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = this.descriptor.urlPaths[0];
            const params = [];

            const dependent = this.getAdditionalInformation(
                OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING
            );
            if (typeof dependent !== 'undefined') {
                params.push(`dependent=${dependent}`);
            }

            if (this.filterValue) {
                params.push(`filter=${this.filterValue}`);
            }

            if (params.length) {
                url += `?${params.join('&')}`;
            }
        }
        return url;
    }

    public setFilterValue(filterValue: string): void {
        this.filterValue = filterValue;
        this.loadOrganisations();
        ContextService.getInstance().setDocumentHistory(true, this, this, null);
    }

    public setAdditionalInformation(key: string, value: any): void {
        super.setAdditionalInformation(key, value);
        if (key === OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING) {
            ContextService.getInstance().setDocumentHistory(true, this, this, null);
        }
    }

    public getIcon(): string {
        return 'kix-icon-organisation';
    }

    public async getDisplayText(): Promise<string> {
        return await TranslationService.translate('Translatable#Organisations');
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
        if (this.filterValue) {
            EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS, KIXObjectType.ORGANISATION);

            const filter = await OrganisationService.getInstance().prepareFullTextFilter(this.filterValue);
            const loadingOptions = new KIXObjectLoadingOptions(filter);

            const organisations = await KIXObjectService.loadObjects(
                KIXObjectType.ORGANISATION, null, loadingOptions, null, false
            ).catch((error) => []);

            this.setObjectList(KIXObjectType.ORGANISATION, organisations);
            super.setFilteredObjectList(KIXObjectType.ORGANISATION, organisations);

            this.loadContacts();
        } else {
            this.setObjectList(KIXObjectType.ORGANISATION, []);
            this.setObjectList(KIXObjectType.CONTACT, []);
        }

    }

    public async loadContacts(): Promise<void> {
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS, KIXObjectType.CONTACT);

        const organisations = this.getFilteredObjectList(KIXObjectType.ORGANISATION);
        const isOrganisationDepending = this.getAdditionalInformation(
            OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING
        );

        let contacts = [];
        const loadingOptions = new KIXObjectLoadingOptions([], null, null, [ContactProperty.USER]);
        if (organisations && organisations.length && isOrganisationDepending) {
            const organisationIds = organisations.map((o) => Number(o.ObjectId));
            if (organisationIds && organisationIds.length) {
                loadingOptions.filter.push(new FilterCriteria(
                    ContactProperty.ORGANISATION_IDS, SearchOperator.IN,
                    FilterDataType.NUMERIC, FilterType.AND, organisationIds
                ));
            }
            contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, null, loadingOptions);
        } else if (!isOrganisationDepending && this.filterValue) {
            const filter = await ContactService.getInstance().prepareFullTextFilter(this.filterValue);
            loadingOptions.filter = filter;
            contacts = await KIXObjectService.loadObjects<Contact>(KIXObjectType.CONTACT, null, loadingOptions);
        }

        this.setObjectList(KIXObjectType.CONTACT, contacts);
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS_FINISHED, KIXObjectType.CONTACT);
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
