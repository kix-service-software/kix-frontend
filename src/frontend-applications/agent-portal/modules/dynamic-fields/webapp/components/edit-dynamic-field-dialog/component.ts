/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractEditDialog } from "../../../../../modules/base-components/webapp/core/AbstractEditDialog";
import { ComponentState } from "./ComponentState";
import { KIXObjectType } from "../../../../../model/kix/KIXObjectType";
import { EditDynamicFieldDialogContext } from "../../core/EditDynamicFieldDialogContext";

class Component extends AbstractEditDialog {

    private formId: string;

    public onInput(input: any) {
        this.formId = input.formId;
    }

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Update Dynamic Field',
            undefined,
            KIXObjectType.DYNAMIC_FIELD,
            EditDynamicFieldDialogContext.CONTEXT_ID
        );
    }

    public async onMount(): Promise<void> {
        await super.onMount();
    }

    public async onDestroy(): Promise<void> {
        await super.onDestroy();
    }

    public async cancel(): Promise<void> {
        await super.cancel();
    }

    public async submit(): Promise<void> {
        await super.submit();
    }

}

module.exports = Component;
