/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextDescriptor } from "../../../../model/ContextDescriptor";
import { ContextConfiguration } from "../../../../model/configuration/ContextConfiguration";
import { Context } from "../../../../model/Context";
import { KIXObjectType } from "../../../../model/kix/KIXObjectType";
import { KIXObjectLoadingOptions } from "../../../../model/KIXObjectLoadingOptions";
import { DynamicFieldProperty } from "../../model/DynamicFieldProperty";
import { KIXObjectService } from "../../../base-components/webapp/core/KIXObjectService";
import { DynamicField } from "../../model/DynamicField";
import { KIXObject } from "../../../../model/kix/KIXObject";

export class EditDynamicFieldDialogContext extends Context {

    public static CONTEXT_ID: string = 'edit-dynamic-field-dialog-context';
    public formListenerId: string;

    public constructor(
        descriptor: ContextDescriptor,
        objectId: string | number = null,
        configuration: ContextConfiguration = null
    ) {
        super(descriptor, objectId, configuration);
    }

    public async getObject<O extends KIXObject>(kixObjectType: KIXObjectType = KIXObjectType.TICKET): Promise<O> {
        let object;
        if (kixObjectType === KIXObjectType.DYNAMIC_FIELD) {
            const fieldId = this.getObjectId();
            if (fieldId) {
                const loadingOptions = new KIXObjectLoadingOptions(
                    null, null, null, [DynamicFieldProperty.CONFIG]
                );
                const objects = await KIXObjectService.loadObjects<DynamicField>(
                    KIXObjectType.DYNAMIC_FIELD, [fieldId], loadingOptions
                );
                object = objects && objects.length ? objects[0] : null;
            }
        }
        return object;
    }
}
