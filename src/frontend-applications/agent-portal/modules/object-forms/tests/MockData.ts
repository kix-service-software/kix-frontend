/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObject } from "../../../model/kix/KIXObject";
import { KIXObjectType } from "../../../model/kix/KIXObjectType";
import { DynamicFieldValue } from "../../dynamic-fields/model/DynamicFieldValue";
import { ObjectFormValue } from "../model/FormValues/ObjectFormValue";
import { SelectObjectFormValue } from "../model/FormValues/SelectObjectFormValue";
import { ObjectFormValueMapper } from "../model/ObjectFormValueMapper";
import { PropertyInstruction } from "../model/PropertyInstruction";
import { RuleResult } from "../model/RuleResult";

export class TestObjectValueMapper extends ObjectFormValueMapper {

    public constructor() {
        super(null);
    }

    protected async mapObjectValues(object: any): Promise<void> {
        super.mapObjectValues(object);

        for (const property in object) {
            if (!Object.prototype.hasOwnProperty.call(object, property)) {
                continue;
            }

            if (property.startsWith('testSelectProperty')) {
                this.formValues.push(new SelectObjectFormValue(property, object, this, null));
            } else {
                this.formValues.push(new ObjectFormValue(property, object, this, null));
            }
        }
    }

    public async applyPropertyInstructionsMock(result: RuleResult, formValue: ObjectFormValue): Promise<void> {
        for (const instruction of result.propertyInstructions) {
            await this.applyPropertyInstructionMock(instruction, formValue);
        }
    }

    private async applyPropertyInstructionMock(instruction: PropertyInstruction, formValue: ObjectFormValue): Promise<void> {
        if (instruction[0] === 'CountMax') {
            formValue.countMax = instruction.CountMax;
        }
    }

}

export class TestFormObject extends KIXObject {

    public constructor(dfNames: string[] = []) {
        super(null);
        this.DynamicFields = [];

        for (const dfName of dfNames) {
            const value = new DynamicFieldValue();
            value.Name = dfName;
            this.DynamicFields.push(value);
        }
    }

    public ObjectId: string | number;
    public KIXObjectType: string = KIXObjectType.TICKET;

    public testProperty1: string = null;
    public testProperty2: string = null;
    public testProperty3: string = null;
    public testProperty4: string = null;
    public testProperty5: string = null;

    public testSelectProperty1: string[] = null;
    public testSelectProperty2: string[] = null;
    public testSelectProperty3: string[] = null;
    public testSelectProperty4: string[] = null;
    public testSelectProperty5: string[] = null;

}