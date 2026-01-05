/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { EventService } from '../../../base-components/webapp/core/EventService';
import { KIXObjectService } from '../../../base-components/webapp/core/KIXObjectService';
import { DynamicFieldObjectFormValue } from '../../model/FormValues/DynamicFieldObjectFormValue';
import { ObjectFormValue } from '../../model/FormValues/ObjectFormValue';
import { SelectObjectFormValue } from '../../model/FormValues/SelectObjectFormValue';
import { InstructionProperty } from '../../model/InstructionProperty';
import { ObjectFormEvent } from '../../model/ObjectFormEvent';
import { ObjectFormEventData } from '../../model/ObjectFormEventData';
import { ObjectFormValueMapper } from '../../model/ObjectFormValueMapper';
import { PropertyInstruction } from '../../model/PropertyInstruction';

export class PropertyInstructionMapper {

    public static async applyPropertyInstruction(
        instruction: PropertyInstruction, mapper: ObjectFormValueMapper
    ): Promise<void> {

        if (instruction.property === 'Submit') {
            const canSubmit = instruction.Enable === true;
            EventService.getInstance().publish(
                ObjectFormEvent.FORM_SUBMIT_ENABLED,
                new ObjectFormEventData(
                    mapper?.objectFormHandler?.context?.instanceId, null, null, null, canSubmit
                )
            );
            return;
        }

        const formValue = await this.getFormValue(instruction.property, mapper);

        if (formValue) {
            await this.handlePropertyInstruction(instruction, formValue);
        }
    }

    private static async getFormValue(property: string, mapper: ObjectFormValueMapper): Promise<ObjectFormValue> {
        let formValue = mapper.findFormValue(property);

        if (!formValue) {
            const dfName = KIXObjectService.getDynamicFieldName(property);
            if (dfName) {
                const dfFormValue = await mapper.getDynamicFieldFormValue(dfName);
                if (dfFormValue) {
                    formValue = await (dfFormValue as DynamicFieldObjectFormValue)?.createFormValue(dfName);
                }
            }
        }

        return formValue;
    }

    private static sortInstructions(instructionOrder: string[]): string[] {
        const instructions = instructionOrder.sort((a, b) => {
            if (a === InstructionProperty.ENABLE) {
                return -1;
            } else if (b === InstructionProperty.ENABLE) {
                return 1;
            }

            return 0;
        });
        return instructions;
    }

    private static async handlePropertyInstruction(
        instruction: PropertyInstruction, formValue: ObjectFormValue
    ): Promise<void> {
        const instructions = this.sortInstructions(instruction.instructionOrder);

        for (const instructionProperty of instructions) {
            if (instructionProperty === InstructionProperty.POSSIBLE_VALUES) {
                formValue.resetProperty(instructionProperty);
                await formValue.setPossibleValues(instruction.PossibleValues);
            }

            if (instructionProperty === InstructionProperty.POSSIBLE_VALUES_ADD) {
                formValue.resetProperty(instructionProperty);
                await formValue.addPossibleValues(instruction.PossibleValuesAdd);
            }

            if (instructionProperty === InstructionProperty.POSSIBLE_VALUES_REMOVE) {
                formValue.resetProperty(instructionProperty);
                await formValue.removePossibleValues(instruction.PossibleValuesRemove);
            }

            if (instructionProperty === InstructionProperty.CLEAR) {
                await formValue.setFormValue(null, true);
            }

            if (instructionProperty === InstructionProperty.SET) {
                await formValue.setFormValue(instruction.Set, true);
            }

            if (instructionProperty === InstructionProperty.READ_ONLY) {
                if (formValue.readonly !== instruction.ReadOnly) {
                    formValue.readonly = instruction.ReadOnly;
                    if (formValue.formValues && formValue.formValues.length > 0) {
                        formValue.formValues.forEach((fv) => {
                            fv.readonly = instruction.ReadOnly;
                        });
                    }
                }
            }

            if (instructionProperty === InstructionProperty.WRITEABLE) {
                if (formValue.readonly === instruction.Writeable) {
                    formValue.readonly = !instruction.Writeable;
                    if (formValue.formValues && formValue.formValues.length > 0) {
                        formValue.formValues.forEach((fv) => {
                            fv.readonly = !instruction.Writeable;
                        });
                    }
                }
            }

            if (instructionProperty === InstructionProperty.SHOW) {
                await formValue.show();
            }

            if (instructionProperty === InstructionProperty.HIDE) {
                await formValue.hide();
            }

            if (instructionProperty === InstructionProperty.REQUIRED) {
                if (formValue.required !== instruction.Required) {
                    formValue.required = instruction.Required;
                    if (formValue.formValues && formValue.formValues.length > 0) {
                        formValue.formValues.forEach((fv) => {
                            fv.required = instruction.Required;
                        });
                    }
                }
            }

            if (instructionProperty === InstructionProperty.OPTIONAL) {
                if (formValue.required === instruction.Optional) {
                    formValue.required = !instruction.Optional;
                    if (formValue.formValues && formValue.formValues.length > 0) {
                        formValue.formValues.forEach((fv) => {
                            fv.required = !instruction.Optional;
                        });
                    }
                }
            }

            if (instructionProperty === InstructionProperty.ENABLE) {
                if (formValue.enabled !== instruction.Enable) {
                    await formValue.enable();
                }
            }

            if (instructionProperty === InstructionProperty.DISABLE) {
                if (formValue.enabled === instruction.Disable) {
                    await formValue.disable();
                }
            }

            if (instructionProperty === InstructionProperty.MIN_SELECTABLE) {
                if (formValue instanceof SelectObjectFormValue) {
                    formValue.minSelectCount = instruction.MinSelectable;
                }
            }

            if (instructionProperty === InstructionProperty.MAX_SELECTABLE) {
                if (formValue instanceof SelectObjectFormValue) {
                    formValue.maxSelectCount = instruction.MaxSelectable;
                }
            }

            if (instructionProperty === InstructionProperty.COUNT_MAX) {
                if (formValue.countMax !== instruction.CountMax) {
                    formValue.countMax = Number(instruction.CountMax) > 0
                        ? Number(instruction.CountMax)
                        : 1;
                }
            }

            if (instructionProperty === InstructionProperty.VALIDATION) {
                formValue.regExList = [
                    {
                        errorMessage: instruction.Validation.RegExErrorMessage,
                        regEx: instruction.Validation.RegEx
                    }
                ];
            }

        }

        await formValue.update();
    }

}