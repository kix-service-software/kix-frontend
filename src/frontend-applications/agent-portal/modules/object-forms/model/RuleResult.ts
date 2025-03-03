/**
 * Copyright (C) 2006-2025 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Ask } from './interactions/Ask';
import { Interaction } from './interactions/Interaction';
import { InteractionType } from './interactions/InteractionType';
import { Tell } from './interactions/Tell';
import { PropertyInstruction } from './PropertyInstruction';

export class RuleResult {

    public InputOrder: string[];
    public propertyInstructions: PropertyInstruction[] = [];
    public conditionProperties: string[] = [];
    public interactions: Interaction[] = [];

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

            if (result.Interactions?.length) {
                this.mapInteractions(result.Interactions);
            }
        }
    }

    private mapInteractions(interactions: Interaction[] = []): void {
        this.interactions = interactions.map((i) => {
            if (i.Type === InteractionType.TELL) {
                return new Tell(i);
            } else if (i.Type === InteractionType.ASK) {
                return new Ask(i as Ask);
            }

            return i;
        });
    }

}