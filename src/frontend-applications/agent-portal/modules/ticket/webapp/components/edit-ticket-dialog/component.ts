/**
 * Copyright (C) 2006-2020 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from "./ComponentState";
import { DialogService } from "../../../../../modules/base-components/webapp/core/DialogService";
import { TranslationService } from "../../../../../modules/translation/webapp/core/TranslationService";
import { FormService } from "../../../../../modules/base-components/webapp/core/FormService";
import { FormFieldConfiguration } from "../../../../../model/configuration/FormFieldConfiguration";
import { FormFieldValue } from "../../../../../model/configuration/FormFieldValue";
import { ArticleProperty } from "../../../model/ArticleProperty";
import { TicketDetailsContext } from "../../core";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { AbstractEditDialog } from "../../../../base-components/webapp/core/AbstractEditDialog";

class Component extends AbstractEditDialog {

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Update Ticket',
            undefined,
            KIXObjectType.TICKET,
            TicketDetailsContext.CONTEXT_ID
        );
    }

    public async onMount(): Promise<void> {
        super.onMount();

        this.state.translations = await TranslationService.createTranslationObject([
            "Translatable#Cancel", "Translatable#Save"
        ]);

        const formInstance = await FormService.getInstance().getFormInstance(this.state.formId);
        if (formInstance) {
            formInstance.registerListener({
                formListenerId: 'new-article-dialog-listener',
                formValueChanged:
                    async (formField: FormFieldConfiguration, value: FormFieldValue<any>, oldValue: any) => {
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
        super.cancel();
    }

    public async onDestroy(): Promise<void> {
        super.onDestroy();
    }

    public async submit(): Promise<void> {
        super.submit();
    }

}

module.exports = Component;
