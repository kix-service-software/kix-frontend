/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import {
    OverlayService, FormService, ContextService, KIXObjectService, BrowserUtil
} from "../../../../core/browser";
import {
    ValidationSeverity, OverlayType, ComponentContent, ValidationResult,
    KIXObjectType, TicketProperty, Error, Ticket, FormField, FormFieldValue, ArticleProperty
} from "../../../../core/model";
import { ComponentState } from "./ComponentState";
import { TicketDetailsContext } from "../../../../core/browser/ticket";
import { TranslationService } from "../../../../core/browser/i18n/TranslationService";
import { DialogService } from "../../../../core/browser/components/dialog";
import { EventService } from "../../../../core/browser/event";
import { ApplicationEvent } from "../../../../core/browser/application";

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        DialogService.getInstance().setMainDialogHint('Translatable#All form fields marked by * are required fields.');

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);

        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.registerListener({
                formListenerId: 'new-article-dialog-listener',
                formValueChanged: async (formField: FormField, value: FormFieldValue<any>, oldValue: any) => {
                    if (formField.property === ArticleProperty.CHANNEL_ID) {
                        if (value && value.value === 2) {
                            this.state.buttonLabel = 'Translatable#Send';
                        } else {
                            this.state.buttonLabel = 'Translatable#Save';
                        }
                    }
                },
                updateForm: () => { return; }
            });
        }
    }

    public async cancel(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
        DialogService.getInstance().closeMainDialog();
    }

    public async onDestroy(): Promise<void> {
        FormService.getInstance().deleteFormInstance(this.state.formId);
    }

    public async submit(): Promise<void> {
        setTimeout(async () => {
            const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
            const result = await formInstance.validateForm();
            const validationError = result.some((r) => r.severity === ValidationSeverity.ERROR);
            if (validationError) {
                this.showValidationError(result);
            } else {
                DialogService.getInstance().setMainDialogLoading(true, "Translatable#Update Ticket");
                const context = await ContextService.getInstance().getContext<TicketDetailsContext>(
                    TicketDetailsContext.CONTEXT_ID
                );
                if (context) {
                    await KIXObjectService.updateObjectByForm(
                        KIXObjectType.TICKET, this.state.formId, context.getObjectId()
                    ).then(async (ticketId) => {
                        EventService.getInstance().publish(ApplicationEvent.REFRESH);
                        const ticket = await context.getObject<Ticket>(
                            KIXObjectType.TICKET, true, [TicketProperty.ARTICLES]
                        );
                        DialogService.getInstance().setMainDialogLoading(false);
                        const article = [...ticket.Articles].sort((a, b) => b.ArticleID - a.ArticleID)[0];
                        DialogService.getInstance().submitMainDialog();
                        if (article.isUnsent()) {
                            BrowserUtil.openErrorOverlay(article.getUnsentError());
                        } else {
                            const toast = await TranslationService.translate('Translatable#Changes saved.');
                            BrowserUtil.openSuccessOverlay(toast);
                        }
                        EventService.getInstance().publish(ApplicationEvent.REFRESH_TOOLBAR);
                    }).catch((error: Error) => {
                        DialogService.getInstance().setMainDialogLoading(false);
                        BrowserUtil.openErrorOverlay(`${error.Code}: ${error.Message}`);
                    });
                }
            }
        }, 300);
    }

    public showValidationError(result: ValidationResult[]): void {
        const errorMessages = result.filter((r) => r.severity === ValidationSeverity.ERROR).map((r) => r.message);
        const content = new ComponentContent('list-with-title',
            {
                title: 'Translatable#Error on form validation:',
                list: errorMessages
            }
        );

        OverlayService.getInstance().openOverlay(
            OverlayType.WARNING, null, content, 'Translatable#Validation error', true
        );
    }

}

module.exports = Component;
