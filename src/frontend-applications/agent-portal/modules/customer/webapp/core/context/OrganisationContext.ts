/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { ContextPreference } from '../../../../../model/ContextPreference';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';

export class OrganisationContext extends Context {

    public static CONTEXT_ID: string = 'organisations';

    public filterValue: string;

    private currentOrganisationLimit: number = 20;
    private currentContactLimit: number = 20;

    public async initContext(urlParams: URLSearchParams): Promise<void> {
        super.initContext(urlParams);

        this.additionalInformation.set(OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING, false);

        if (this.filterValue) {
            this.loadOrganisations();
        }
    }

    public async update(urlParams: URLSearchParams): Promise<void> {
        this.handleURLParams(urlParams);
    }

    private handleURLParams(urlParams: URLSearchParams): void {
        if (urlParams) {
            if (urlParams.has('dependent')) {
                this.additionalInformation.set(
                    OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING,
                    urlParams.get('dependent') === 'true'
                );
            }

            if (urlParams.has('filter')) {
                this.filterValue = decodeURI(urlParams.get('filter'));
            }
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
                params.push(`filter=${encodeURIComponent(this.filterValue)}`);
            }

            if (params.length) {
                url += `?${params.join('&')}`;
            }
        }
        return url;
    }

    public async setFilterValue(filterValue: string): Promise<void> {
        this.currentOrganisationLimit = 20;
        this.currentContactLimit = 20;

        this.filterValue = filterValue;
        this.loadOrganisations();
        ContextService.getInstance().setDocumentHistory(true, this, this, null);

        const isStored = await ContextService.getInstance().isContextStored(this.instanceId);
        if (isStored) {
            ContextService.getInstance().updateStorage(this.instanceId);
        }
    }

    public async setAdditionalInformation(key: string, value: any): Promise<void> {
        super.setAdditionalInformation(key, value);
        if (key === OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING) {
            ContextService.getInstance().setDocumentHistory(true, this, this, null);
            const isStored = await ContextService.getInstance().isContextStored(this.instanceId);
            if (isStored) {
                ContextService.getInstance().updateStorage(this.instanceId);
            }
        }
    }

    public getIcon(): string {
        return 'kix-icon-organisation';
    }

    public async getDisplayText(): Promise<string> {
        return await TranslationService.translate('Translatable#Organisations');
    }

    public setFilteredObjectList(objectType: KIXObjectType, filteredObjectList: KIXObject[]): void {
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

    private async loadOrganisations(limit?: number): Promise<void> {
        if (this.filterValue) {
            EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS, KIXObjectType.ORGANISATION);

            const filter = await OrganisationService.getInstance().prepareFullTextFilter(this.filterValue);
            const loadingOptions = new KIXObjectLoadingOptions(filter);
            loadingOptions.limit = limit;
            loadingOptions.includes = [KIXObjectProperty.DYNAMIC_FIELDS];

            const collectionId = this.contextId + KIXObjectType.ORGANISATION;

            this.prepareContextLoadingOptions(KIXObjectType.ORGANISATION, loadingOptions);

            const organisations = await KIXObjectService.loadObjects(
                KIXObjectType.ORGANISATION, null, loadingOptions, null, false, undefined, undefined, collectionId
            ).catch((error) => []);

            this.setObjectList(KIXObjectType.ORGANISATION, organisations);
            super.setFilteredObjectList(KIXObjectType.ORGANISATION, organisations);

            this.loadContacts();
        } else {
            this.setObjectList(KIXObjectType.ORGANISATION, []);
            this.setObjectList(KIXObjectType.CONTACT, []);
        }

    }

    public async loadContacts(limit?: number): Promise<void> {
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS, KIXObjectType.CONTACT);

        const organisations = this.getFilteredObjectList(KIXObjectType.ORGANISATION);
        const isOrganisationDepending = this.getAdditionalInformation(
            OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING
        );

        let contacts = [];
        const loadingOptions = new KIXObjectLoadingOptions([]);
        loadingOptions.includes = [ContactProperty.USER, KIXObjectProperty.DYNAMIC_FIELDS];
        loadingOptions.limit = limit;

        const collectionId = this.contextId + KIXObjectType.CONTACT;

        if (organisations && organisations.length && isOrganisationDepending) {
            const organisationIds = organisations.map((o) => Number(o.ObjectId));
            if (organisationIds && organisationIds.length) {
                loadingOptions.filter.push(new FilterCriteria(
                    ContactProperty.ORGANISATION_IDS, SearchOperator.IN,
                    FilterDataType.NUMERIC, FilterType.AND, organisationIds
                ));
            }
            this.prepareContextLoadingOptions(KIXObjectType.CONTACT, loadingOptions);
            contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, null, loadingOptions, undefined, undefined, undefined, undefined, collectionId
            );
        } else if (!isOrganisationDepending && this.filterValue) {
            const filter = await ContactService.getInstance().prepareFullTextFilter(this.filterValue);
            loadingOptions.filter = filter;
            this.prepareContextLoadingOptions(KIXObjectType.CONTACT, loadingOptions);
            contacts = await KIXObjectService.loadObjects<Contact>(
                KIXObjectType.CONTACT, null, loadingOptions, undefined, undefined, undefined, undefined, collectionId
            );
        }

        this.setObjectList(KIXObjectType.CONTACT, contacts);
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS_FINISHED, KIXObjectType.CONTACT);
    }

    public reloadObjectList(objectType: KIXObjectType, silent: boolean = false, limit: number = 20): Promise<void> {
        if (objectType === KIXObjectType.ORGANISATION) {
            this.currentOrganisationLimit = limit;
            return this.loadOrganisations(this.currentOrganisationLimit);
        } else if (objectType === KIXObjectType.CONTACT) {
            this.currentContactLimit = limit;
            return this.loadContacts(this.currentContactLimit);
        }
    }

    public async addStorableAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        super.addStorableAdditionalInformation(contextPreference);
        contextPreference['FILTER_VALUE'] = this.filterValue;
        contextPreference[OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING] =
            this.getAdditionalInformation(OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING);
    }

    public async loadAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        super.loadAdditionalInformation(contextPreference);
        this.filterValue = contextPreference['FILTER_VALUE'];
        this.setAdditionalInformation(
            OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING,
            contextPreference[OrganisationAdditionalInformationKeys.ORGANISATION_DEPENDING]
        );
    }

}

export enum OrganisationAdditionalInformationKeys {

    ORGANISATION_DEPENDING = 'ORGANISATION_DEPENDING'

}
