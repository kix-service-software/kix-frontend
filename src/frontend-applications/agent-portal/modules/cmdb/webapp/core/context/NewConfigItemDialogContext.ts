/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../model/Context';
import { KIXObject } from '../../../../../model/kix/KIXObject';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { VersionProperty } from '../../../model/VersionProperty';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { ConfigItemProperty } from '../../../model/ConfigItemProperty';
import { FilterCriteria } from '../../../../../model/FilterCriteria';
import { KIXObjectProperty } from '../../../../../model/kix/KIXObjectProperty';
import { SearchOperator } from '../../../../search/model/SearchOperator';
import { FilterDataType } from '../../../../../model/FilterDataType';
import { FilterType } from '../../../../../model/FilterType';
import { ConfigItemClass } from '../../../model/ConfigItemClass';
import { ConfigItemFormFactory } from '../ConfigItemFormFactory';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';

export class NewConfigItemDialogContext extends Context {

    public static CONTEXT_ID: string = 'new-config-item-dialog-context';

    public async getObject<O extends KIXObject>(
        objectType: KIXObjectType = KIXObjectType.CONFIG_ITEM, reload: boolean = false, changedProperties?: string[]
    ): Promise<O> {
        let object;
        const objectId = this.getObjectId();
        if (objectId) {
            const loadingOptions = new KIXObjectLoadingOptions(
                null, null, null,
                [
                    ConfigItemProperty.CURRENT_VERSION, VersionProperty.DEFINITION,
                    VersionProperty.DATA, VersionProperty.PREPARED_DATA
                ]
            );
            const objects = await KIXObjectService.loadObjects(objectType, [objectId], loadingOptions);
            object = objects && objects.length ? objects[0] : null;
        }
        return object;
    }

    public async initContext(urlParams?: URLSearchParams): Promise<void> {
        await super.initContext(urlParams);
        let classId = this.getAdditionalInformation(ConfigItemProperty.CLASS_ID);
        if (!classId) {
            const previousContext = ContextService.getInstance().getActiveContext();
            classId = previousContext?.getAdditionalInformation(ConfigItemProperty.CLASS_ID);
        }

        this.setAdditionalInformation(ConfigItemProperty.CLASS_ID, classId);
    }

    public async postInit(): Promise<void> {
        await super.postInit();

        const formId = await this.getFormManager().getFormId();

        if (!formId) {
            const classId = this.getAdditionalInformation(ConfigItemProperty.CLASS_ID) || await this.getFirstClass();
            if (classId) {
                this.setClassId(classId);
            }
        }
    }

    private async getFirstClass(): Promise<number> {
        const loadingOptions = new KIXObjectLoadingOptions([
            new FilterCriteria(
                KIXObjectProperty.VALID_ID, SearchOperator.EQUALS, FilterDataType.NUMERIC, FilterType.AND, 1
            )
        ]);
        const ciClasses = await KIXObjectService.loadObjects<ConfigItemClass>(
            KIXObjectType.CONFIG_ITEM_CLASS, null, loadingOptions, null, false
        ).catch((): ConfigItemClass[] => []);

        return ciClasses?.length ? ciClasses[0].ID : null;
    }

    public setClassId(classId: number): void {
        ConfigItemFormFactory.getInstance().createAndProvideForm(classId, this);
    }

}
