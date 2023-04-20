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
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { ConfigItemProperty } from '../../../model/ConfigItemProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ServiceRegistry } from '../../../../../modules/base-components/webapp/core/ServiceRegistry';
import { CMDBService } from '..';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { ContextUIEvent } from '../../../../base-components/webapp/core/ContextUIEvent';
import { EventService } from '../../../../base-components/webapp/core/EventService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { LabelService } from '../../../../base-components/webapp/core/LabelService';
import { ContextEvents } from '../../../../base-components/webapp/core/ContextEvents';
import { ContextPreference } from '../../../../../model/ContextPreference';
import { IdService } from '../../../../../model/IdService';
import { IEventSubscriber } from '../../../../base-components/webapp/core/IEventSubscriber';
import { TicketContext } from '../../../../ticket/webapp/core';

export class CMDBContext extends Context {

    public static CONTEXT_ID: string = 'cmdb';

    public classId: number;
    public filterValue: string;

    private subscriber: IEventSubscriber;

    public async initContext(urlParams?: URLSearchParams): Promise<void> {
        super.initContext();

        if (this.classId || this.filterValue) {
            this.loadConfigItems();
        }


        this.subscriber = {
            eventSubscriberId: IdService.generateDateBasedId(TicketContext.CONTEXT_ID),
            eventPublished: (data: Context, eventId: string): void => {
                if (data.instanceId === this.instanceId) {
                    this.loadConfigItems();
                }
            }
        };

        EventService.getInstance().subscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
    }

    public async destroy(): Promise<void> {
        EventService.getInstance().unsubscribe(ContextEvents.CONTEXT_CHANGED, this.subscriber);
    }

    public getIcon(): string {
        return 'kix-icon-cmdb';
    }

    public async getDisplayText(): Promise<string> {
        let text = await TranslationService.translate('Translatable#Assets');
        if (this.classId) {
            const className = await LabelService.getInstance().getPropertyValueDisplayText(
                KIXObjectType.CONFIG_ITEM, ConfigItemProperty.CLASS_ID, this.classId
            );
            text = await TranslationService.translate('Assets: {0}', [className]);
        }
        return text;
    }

    public async update(urlParams: URLSearchParams): Promise<void> {
        this.handleURLParams(urlParams);
    }

    private handleURLParams(urlParams: URLSearchParams): void {
        if (urlParams) {
            this.setCIClass(urlParams.has('classId') ? Number(urlParams.get('classId')) : null, false);
            this.setFilterValue(urlParams.has('filter') ? decodeURI(urlParams.get('filter')) : null, false);
        }
    }

    public async getUrl(): Promise<string> {
        let url: string = '';
        if (Array.isArray(this.descriptor.urlPaths) && this.descriptor.urlPaths.length) {
            url = this.descriptor.urlPaths[0];
            const params = [];
            if (this.classId) {
                params.push(`classId=${this.classId}`);
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

    public async setCIClass(classId: number, history: boolean = true): Promise<void> {
        if (!this.classId || this.classId !== classId) {
            this.classId = classId;
            this.setAdditionalInformation(ConfigItemProperty.CLASS_ID, classId);

            EventService.getInstance().publish(ContextEvents.CONTEXT_PARAMETER_CHANGED, this);

            this.loadConfigItems();

            if (history) {
                ContextService.getInstance().setDocumentHistory(true, this, this, null);
            }
        }

        const isStored = await ContextService.getInstance().isContextStored(this.instanceId);
        if (isStored) {
            ContextService.getInstance().updateStorage(this.instanceId);
        }
    }

    public async setFilterValue(filterValue: string, history: boolean = true): Promise<void> {
        this.filterValue = filterValue;

        EventService.getInstance().publish(ContextEvents.CONTEXT_PARAMETER_CHANGED, this);

        this.loadConfigItems();

        if (history) {
            ContextService.getInstance().setDocumentHistory(true, this, this, null);
        }

        const isStored = await ContextService.getInstance().isContextStored(this.instanceId);
        if (isStored) {
            ContextService.getInstance().updateStorage(this.instanceId);
        }
    }

    public async loadConfigItems(limit: number = 20): Promise<void> {
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS, KIXObjectType.CONFIG_ITEM);

        const loadingOptions = new KIXObjectLoadingOptions([]);
        loadingOptions.limit = limit;

        const deploymentIds = await this.getDeploymentStateIds();
        loadingOptions.filter.push(
            new FilterCriteria(
                'DeplStateIDs', SearchOperator.IN, FilterDataType.NUMERIC,
                FilterType.AND, deploymentIds
            )
        );

        if (this.classId) {
            loadingOptions.filter.push(new FilterCriteria(
                'ClassIDs', SearchOperator.IN, FilterDataType.NUMERIC,
                FilterType.AND, [this.classId]
            ));
        }

        if (this.filterValue) {
            loadingOptions.filter.push(new FilterCriteria(
                ConfigItemProperty.NUMBER, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${this.filterValue}*`
            ));
            loadingOptions.filter.push(new FilterCriteria(
                ConfigItemProperty.NAME, SearchOperator.LIKE,
                FilterDataType.STRING, FilterType.OR, `*${this.filterValue}*`
            ));
        }

        if (!this.filterValue && !this.classId) {
            const incidentStates = await CMDBService.getInstance().getAffactedIncidentStates();
            if (incidentStates && incidentStates.length) {
                loadingOptions.filter.push(new FilterCriteria(
                    'InciStateIDs', SearchOperator.IN,
                    FilterDataType.NUMERIC, FilterType.AND,
                    incidentStates.map((s) => s.ItemID)
                ));
            }
            loadingOptions.sortOrder = 'ConfigItem.ChangeTime:datetime';
        }

        const configItems = await KIXObjectService.loadObjects(
            KIXObjectType.CONFIG_ITEM, null, loadingOptions, null, false, undefined, undefined,
            this.contextId + KIXObjectType.CONFIG_ITEM
        ).catch((error) => []);

        this.setObjectList(KIXObjectType.CONFIG_ITEM, configItems);
        this.setFilteredObjectList(KIXObjectType.CONFIG_ITEM, configItems);
    }

    private async getDeploymentStateIds(): Promise<number[]> {
        const service = ServiceRegistry.getServiceInstance<CMDBService>(
            KIXObjectType.CONFIG_ITEM
        );
        const catalogItems = await service.getDeploymentStates();
        return catalogItems.map((c) => c.ItemID);
    }

    public async getObjectList<T = KIXObject>(objectType: KIXObjectType, limit: number = 20): Promise<T[]> {
        return await super.getObjectList(objectType, limit);
    }

    public reloadObjectList(
        objectType: KIXObjectType | string, silent: boolean = false, limit?: number
    ): Promise<void> {
        if (objectType === KIXObjectType.CONFIG_ITEM) {
            return this.loadConfigItems(limit);
        }
    }

    public async addStorableAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        super.addStorableAdditionalInformation(contextPreference);
        contextPreference['CLASS_ID'] = this.getAdditionalInformation(ConfigItemProperty.CLASS_ID);
        contextPreference['FILTER_VALUE'] = this.filterValue;
    }

    public async loadAdditionalInformation(contextPreference: ContextPreference): Promise<void> {
        super.loadAdditionalInformation(contextPreference);
        this.classId = contextPreference['CLASS_ID'];
        this.setAdditionalInformation(ConfigItemProperty.CLASS_ID, this.classId);
        this.filterValue = contextPreference['FILTER_VALUE'];
    }

}
