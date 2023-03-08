/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractDynamicFormManager } from '../../../base-components/webapp/core/dynamic-form/AbstractDynamicFormManager';
import { KIXObject } from '../../../../model/kix/KIXObject';
import { KIXObjectService } from '../../../../modules/base-components/webapp/core/KIXObjectService';
import { ImportPropertyOperator } from './ImportPropertyOperator';
import { ImportPropertyOperatorUtil } from './ImportPropertyOperatorUtil';
import { InputFieldTypes } from '../../../../modules/base-components/webapp/core/InputFieldTypes';
import { ObjectPropertyValue } from '../../../../model/ObjectPropertyValue';
import { LabelService } from '../../../../modules/base-components/webapp/core/LabelService';

export abstract class ImportManager extends AbstractDynamicFormManager {

    public objects: KIXObject[] = [];

    protected importRun: boolean = false;

    public init(): void {
        super.init();
        this.importRun = false;
    }

    public getImportRunState(): boolean {
        return this.importRun;
    }

    public async getOperations(property: string): Promise<ImportPropertyOperator[]> {
        return [
            ImportPropertyOperator.REPLACE_EMPTY,
            ImportPropertyOperator.FORCE,
            ImportPropertyOperator.IGNORE
        ];
    }

    public getOperatorDisplayText(operator: ImportPropertyOperator): Promise<string> {
        return ImportPropertyOperatorUtil.getText(operator);
    }

    public async getInputType(property: string): Promise<InputFieldTypes> {
        return InputFieldTypes.TEXT;
    }

    public showValueInput(value: ObjectPropertyValue): boolean {
        return value.property && value.operator && value.operator !== ImportPropertyOperator.IGNORE;
    }

    public async getEditableValues(): Promise<ObjectPropertyValue[]> {
        return [...this.values.filter(
            (bv) => bv.operator === ImportPropertyOperator.IGNORE
                || bv.property !== null
        )];
    }

    public async getIdentifierText(object: KIXObject): Promise<string> {
        return await LabelService.getInstance().getObjectText(object);
    }
}
