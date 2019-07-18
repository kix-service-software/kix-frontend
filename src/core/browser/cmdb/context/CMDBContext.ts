/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    Context, ConfigItemClass, KIXObjectType, KIXObjectLoadingOptions,
    FilterCriteria, ConfigItemProperty, FilterDataType, FilterType, VersionProperty, KIXObject
} from "../../../model";
import { ServiceRegistry, KIXObjectService } from "../../kix";
import { SearchOperator } from "../../SearchOperator";
import { CMDBService } from "../CMDBService";
import { EventService } from "../../event";
import { ApplicationEvent } from "../../application";

export class CMDBContext extends Context {

    public static CONTEXT_ID: string = 'cmdb';

    public currentCIClass: ConfigItemClass;

    public getIcon(): string {
        return 'kix-icon-cmdb';
    }

    public async getDisplayText(): Promise<string> {
        return 'CMDB Dashboard';
    }

    public async setCIClass(ciClass: ConfigItemClass): Promise<void> {
        this.currentCIClass = ciClass;
        await this.loadConfigItems();
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

        const loadingOptions = new KIXObjectLoadingOptions(
            filterCriteria, null, null, [VersionProperty.DATA, VersionProperty.PREPARED_DATA]
        );

        const timeout = window.setTimeout(() => {
            EventService.getInstance().publish(ApplicationEvent.APP_LOADING, {
                loading: true, hint: `Translatable#Load Config Items`
            });
        }, 500);

        const configItems = await KIXObjectService.loadObjects(
            KIXObjectType.CONFIG_ITEM, null, loadingOptions, null, false
        ).catch((error) => []);

        window.clearTimeout(timeout);

        this.setObjectList(configItems);
        EventService.getInstance().publish(ApplicationEvent.APP_LOADING, { loading: false });
    }

    private async getDeploymentStateIds(): Promise<number[]> {
        const service = ServiceRegistry.getServiceInstance<CMDBService>(
            KIXObjectType.CONFIG_ITEM
        );
        const catalogItems = await service.getDeploymentStates();
        return catalogItems.map((c) => c.ItemID);
    }

    public async getObjectList(reload: boolean = false): Promise<KIXObject[]> {
        if (reload) {
            await this.loadConfigItems();
        }
        return await super.getObjectList();
    }

    public reset(): void {
        super.reset();
        this.currentCIClass = null;
    }

}
