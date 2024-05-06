/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { PropertyInstruction } from './PropertyInstruction';

export class RuleResult {

    public InputOrder: string[];
    public propertyInstructions: PropertyInstruction[] = [];
    public conditionProperties: string[] = [];

    public constructor(result: any) {
        if (result?.EvaluationResult) {
            const evaluationResult = result.EvaluationResult;

            this.InputOrder = evaluationResult?.InputOrder || [];

            for (const value in evaluationResult) {
                if (Object.prototype.hasOwnProperty.call(evaluationResult, value) && value !== 'InputOrder') {
                    this.propertyInstructions.push(new PropertyInstruction(value, evaluationResult[value]));
                }
            }

            this.conditionProperties = result.ConditionProperties || [];
        }
    }

}