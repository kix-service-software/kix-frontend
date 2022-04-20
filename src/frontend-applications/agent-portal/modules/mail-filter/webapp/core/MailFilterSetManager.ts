/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    AbstractDynamicFormManager
} from '../../../base-components/webapp/core/dynamic-form/AbstractDynamicFormManager';
import { KIXObjectType } from '../../../../model/kix/KIXObjectType';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { SysConfigOption } from '../../../sysconfig/model/SysConfigOption';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { SysConfigKey } from '../../../sysconfig/model/SysConfigKey';
import { DynamicFormOperationsType } from '../../../base-components/webapp/core/dynamic-form/DynamicFormOperationsType';

export class MailFilterSetManager extends AbstractDynamicFormManager {

    public objectType: KIXObjectType = KIXObjectType.PERMISSION_TYPE;

    public async getInputType(property: string): Promise<InputFieldTypes | string> {
        return InputFieldTypes.TEXT;
    }

    public getSpecificInput(): string {
        return;
    }

    public async getProperties(): Promise<Array<[string, string]>> {
        const headerConfig: SysConfigOption[] = await KIXObjectService.loadObjects<SysConfigOption>(
            KIXObjectType.SYS_CONFIG_OPTION, [SysConfigKey.POSTMASTER_X_HEADER]
        ).catch((error) => []);
        let header = [];
        if (headerConfig && !!headerConfig.length) {
            header = headerConfig[0].Value.sort().filter((h) => h.toString().match(/^X-KIX-/)).map((h) => [h, h]);
        }
        return header;
    }

    public async getPropertiesPlaceholder(): Promise<string> {
        return '';
    }

    public async getOperationsPlaceholder(): Promise<string> {
        return;
    }

    public async getOpertationsType(property: string): Promise<DynamicFormOperationsType> {
        return DynamicFormOperationsType.NONE;
    }

    public async getOperations(property: string): Promise<any[]> {
        return [];
    }

    public showValueInput(): boolean {
        return true;
    }

    public async clearValueOnPropertyChange(property: string): Promise<boolean> {
        return false;
    }
}
