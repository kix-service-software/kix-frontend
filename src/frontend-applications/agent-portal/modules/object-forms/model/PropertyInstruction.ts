/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { InstructionProperty } from './InstructionProperty';
import { ValidationInstruction } from './ValidationInstruction';

export class PropertyInstruction {

    public PossibleValues: any[];
    public PossibleValuesAdd: any[];
    public PossibleValuesRemove: any[];

    public MinSelectable: number;
    public MaxSelectable: number;

    public Set: any;

    public ReadOnly: boolean;
    public Writeable: boolean;

    public Clear: boolean;

    public Show: boolean;
    public Hide: boolean;
    public Enable: boolean;
    public Disable: boolean;

    public Optional: boolean;
    public Required: boolean;

    public CountMax: number;
    public Validation: ValidationInstruction;

    public instructionOrder: string[] = [];

    public constructor(public property: string, instructions: any[]) {
        if (Array.isArray(instructions)) {

            const booleanProperties = [
                InstructionProperty.CLEAR,
                InstructionProperty.READ_ONLY, InstructionProperty.WRITEABLE,
                InstructionProperty.SHOW, InstructionProperty.HIDE,
                InstructionProperty.ENABLE, InstructionProperty.DISABLE,
                InstructionProperty.OPTIONAL, InstructionProperty.REQUIRED
            ];

            for (const instruction of instructions) {
                for (const prop in instruction) {
                    if (Object.prototype.hasOwnProperty.call(instruction, prop)) {
                        if (booleanProperties.some((bp) => bp === prop)) {
                            this.setBooleanValue(prop, instruction);
                        } else {
                            this[prop] = instruction[prop];
                        }

                        this.instructionOrder.push(prop);
                    }
                }
            }
        }
    }

    private setBooleanValue(property: string, instruction: PropertyInstruction): void {
        if (typeof instruction !== 'undefined') {
            this[property] = Boolean(instruction[property]);
        }
    }
}