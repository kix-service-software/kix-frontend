/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { KIXObjectType } from "../../../../../core/model";
import { ComponentState } from "./ComponentState";
import { AbstractEditDialog } from "../../../../../core/browser/components/dialog";
import { EditGeneralCatalogDialogContext } from "../../../../../core/browser/general-catalog";

class Component extends AbstractEditDialog {

    private formId: string;

    public onCreate(): void {
        this.state = new ComponentState();
        super.init(
            'Translatable#Update Value',
            undefined,
            KIXObjectType.GENERAL_CATALOG_ITEM,
            EditGeneralCatalogDialogContext.CONTEXT_ID
        );
    }

    public onInput(input: any) {
        this.formId = input.formId;
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
