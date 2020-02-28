/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from "../../../../../model/Context";
import { ConfigItemClass } from "../../../model/ConfigItemClass";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";
import { FilterCriteria } from "../../../../../model/FilterCriteria";
import { ConfigItemProperty } from "../../../model/ConfigItemProperty";
import { SearchOperator } from "../../../../search/model/SearchOperator";
import { FilterDataType } from "../../../../../model/FilterDataType";
import { FilterType } from "../../../../../model/FilterType";
import { KIXObjectLoadingOptions } from "../../../../../model/KIXObjectLoadingOptions";
import { EventService } from "../../../../../modules/base-components/webapp/core/EventService";
import { ApplicationEvent } from "../../../../../modules/base-components/webapp/core/ApplicationEvent";
import { KIXObjectService } from "../../../../../modules/base-components/webapp/core/KIXObjectService";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { ServiceRegistry } from "../../../../../modules/base-components/webapp/core/ServiceRegistry";
import { CMDBService } from "..";
import { KIXObject } from "../../../../../model/kix/KIXObject";

export class CMDBContext extends Context {

    public static CONTEXT_ID: string = 'cmdb';

    public currentCIClass: ConfigItemClass;

    public getIcon(): string {
        return 'kix-icon-cmdb';
    }

    public async getDisplayText(): Promise<string> {
        const title = await TranslationService.translate('Translatable#CMDB Dashboard');
        return title;
    }

    public async setCIClass(ciClass: ConfigItemClass): Promise<void> {
        if (ciClass) {
            if (!this.currentCIClass || ciClass.ID !== this.currentCIClass.ID) {
                this.currentCIClass = ciClass;
                await this.loadConfigItems();
            }
        } else if (this.currentCIClass || typeof this.currentCIClass === 'undefined') {
            this.currentCIClass = null;
            await this.loadConfigItems();
        }
    }

    public async loadConfigItems(): Promise<void> {
        const deploymentIds = await this.getDeploymentStateIds();

        const filterCriteria = [
            new FilterCriteria(
                ConfigItemProperty.CUR_DEPL_STATE_ID, SearchOperator.IN, FilterDataType.NUMERIC,
                FilterType.AND, deploymentIds
            )
        ];

        if (this.currentCIClass) {
            filterCriteria.push(new FilterCriteria(
                ConfigItemProperty.CLASS_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC,
                FilterType.AND, this.currentCIClass.ID
            ));
        }

        const loadingOptions = new KIXObjectLoadingOptions(filterCriteria);

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: 'Translatable#Load Config Items'
            });
        }, 500);

        const configItems = await KIXObjectService.loadObjects(
            KIXObjectType.CONFIG_ITEM, null, loadingOptions, null, false
        ).catch((error) => []);

        window.clearTimeout(timeout);

        this.setObjectList(KIXObjectType.CONFIG_ITEM, configItems);
        this.setFilteredObjectList(KIXObjectType.CONFIG_ITEM, configItems);
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
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
        this.loadConfigItems();
    }

    public reloadObjectList(objectType: KIXObjectType | string): Promise<void> {
        if (objectType === KIXObjectType.CONFIG_ITEM) {
            return this.loadConfigItems();
        }
    }

}
