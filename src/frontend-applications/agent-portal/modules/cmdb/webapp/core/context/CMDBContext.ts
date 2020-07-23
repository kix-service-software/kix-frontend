/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { ConfigItemClass } from '../../../model/ConfigItemClass';
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

export class CMDBContext extends Context {

    public static CONTEXT_ID: string = 'cmdb';

    public currentCIClass: ConfigItemClass;
    public filterValue: string;

    public getIcon(): string {
        return 'kix-icon-cmdb';
    }

    public async getDisplayText(): Promise<string> {
        const title = await TranslationService.translate('Translatable#CMDB Dashboard');
        return title;
    }

    public setCIClass(ciClass: ConfigItemClass): void {
        if (ciClass) {
            if (!this.currentCIClass || ciClass.ID !== this.currentCIClass.ID) {
                this.currentCIClass = ciClass;
                this.loadConfigItems();
            }
        } else if (this.currentCIClass || typeof this.currentCIClass === 'undefined') {
            this.currentCIClass = null;
            this.loadConfigItems();
        }
    }

    public setFilterValue(filterValue: string): void {
        this.filterValue = filterValue;
        this.loadConfigItems();
    }

    public async loadConfigItems(): Promise<void> {
        EventService.getInstance().publish(ContextUIEvent.RELOAD_OBJECTS, KIXObjectType.CONFIG_ITEM);

        const loadingOptions = new KIXObjectLoadingOptions([]);

        const deploymentIds = await this.getDeploymentStateIds();
        loadingOptions.filter.push(
            new FilterCriteria(
                'DeplStateIDs', SearchOperator.IN, FilterDataType.NUMERIC,
                FilterType.AND, deploymentIds
            )
        );

        if (this.currentCIClass) {
            loadingOptions.filter.push(new FilterCriteria(
                'ClassIDs', SearchOperator.IN, FilterDataType.NUMERIC,
                FilterType.AND, [this.currentCIClass.ID]
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

        if (!this.filterValue && !this.currentCIClass) {
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
            KIXObjectType.CONFIG_ITEM, null, loadingOptions, null, false
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

    public async getObjectList(objectType: KIXObjectType): Promise<KIXObject[]> {
        return await super.getObjectList(objectType);
    }

    public reset(): void {
        super.reset();
        this.currentCIClass = null;
        this.filterValue = null;
        this.loadConfigItems();
    }

    public reloadObjectList(objectType: KIXObjectType | string): Promise<void> {
        if (objectType === KIXObjectType.CONFIG_ITEM) {
            return this.loadConfigItems();
        }
    }

}
