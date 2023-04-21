/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectFormService } from '../../../../modules/base-components/webapp/core/KIXObjectFormService';

import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { KIXObjectSpecificCreateOptions } from '../../../../model/KIXObjectSpecificCreateOptions';
import { SystemAddressProperty } from '../../model/SystemAddressProperty';
import { KIXObjectProperty } from '../../../../model/kix/KIXObjectProperty';

export class SystemAddressFormService extends KIXObjectFormService {

    private static INSTANCE: SystemAddressFormService = null;

    public static getInstance(): SystemAddressFormService {
        if (!SystemAddressFormService.INSTANCE) {
            SystemAddressFormService.INSTANCE = new SystemAddressFormService();
        }

        return SystemAddressFormService.INSTANCE;
    }

    private constructor() {
        super();
    }

    public isServiceFor(kixObjectType: KIXObjectType): boolean {
        return kixObjectType === KIXObjectType.SYSTEM_ADDRESS;
    }


    public async getFormParameter(
        forUpdate: boolean = false, createOptions?: KIXObjectSpecificCreateOptions
    ): Promise<Array<[string, any]>> {
        let parameter = await super.getFormParameter(forUpdate, createOptions);

        // filter parameter (updated by setup assistant)
        if (forUpdate) {
            const knownProperties = [
                ...Object.keys(SystemAddressProperty).map((p) => SystemAddressProperty[p]),
                ...Object.keys(KIXObjectProperty).map((p) => KIXObjectProperty[p])
            ];
            parameter = parameter.filter((v) => knownProperties.some((p) => p === v[0]));
        }

        return parameter;
    }
}
