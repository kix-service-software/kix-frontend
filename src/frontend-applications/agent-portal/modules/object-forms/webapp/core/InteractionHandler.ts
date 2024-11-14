/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AdditionalContextInformation } from '../../../base-components/webapp/core/AdditionalContextInformation';
import { ContextService } from '../../../base-components/webapp/core/ContextService';
import { KIXModulesService } from '../../../base-components/webapp/core/KIXModulesService';
import { Ask } from '../../model/interactions/Ask';
import { Interaction } from '../../model/interactions/Interaction';
import { InteractionType } from '../../model/interactions/InteractionType';
import { Tell } from '../../model/interactions/Tell';

declare const bootstrap: any;

export class InteractionHandler {

    public static async handle(interaction: Interaction): Promise<void> {
        if (interaction.Type === InteractionType.TELL) {
            await this.openTellModal(interaction as Tell);
        } else if (interaction.Type === InteractionType.ASK) {
            await this.openAskModal(interaction as Ask);
        }
    }

    public static openTellModal(tell: Tell): Promise<void> {
        const modalId = 'interaction-tell-modal';
        return new Promise<void>((resolve, reject) => {
            const modalArea = document.getElementById('kix-modal-area');
            if (modalArea) {
                let tellModal;
                const template = KIXModulesService.getComponentTemplate(modalId);
                const content = template?.default?.renderSync({
                    title: tell.Title,
                    message: tell.Message,
                    severity: tell.Severity,
                    closeCallback: () => {
                        resolve();
                        tellModal?.hide();
                        const modalElement = document.getElementById(modalId);
                        modalElement?.remove();
                    }
                });
                content.appendTo(modalArea);

                tellModal = new bootstrap.Modal(`#${modalId}`, {});
                tellModal?.show();
            }
        });
    }

    public static openAskModal(ask: Ask): Promise<void> {
        const modalId = 'interaction-ask-modal';
        return new Promise<void>((resolve, reject) => {
            const modalArea = document.getElementById('kix-modal-area');
            if (modalArea) {
                let askModal;
                const template = KIXModulesService.getComponentTemplate(modalId);
                const content = template?.default?.renderSync({
                    title: ask.Title,
                    question: ask.Question,
                    options: ask.Options,
                    closeCallback: (answer: string) => {

                        const context = ContextService.getInstance().getActiveContext();
                        const answers = context.getAdditionalInformation(
                            AdditionalContextInformation.FORM_ASK_ANSWERS
                        ) || {};

                        answers[ask.Identifier] = answer;

                        context.setAdditionalInformation(
                            AdditionalContextInformation.FORM_ASK_ANSWERS, answers
                        );

                        resolve();
                        askModal?.hide();
                        const modalElement = document.getElementById(modalId);
                        modalElement?.remove();
                    }
                });
                content.appendTo(modalArea);

                askModal = new bootstrap.Modal(`#${modalId}`, {});
                askModal?.show();
            }
        });
    }

}