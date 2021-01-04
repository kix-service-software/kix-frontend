/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { IOverlayDialogListener } from '../../../../../../modules/base-components/webapp/core/IOverlayDialogListener';
import { DialogService } from '../../../../../../modules/base-components/webapp/core/DialogService';
import { WidgetType } from '../../../../../../model/configuration/WidgetType';
import { KIXModulesService } from '../../../../../../modules/base-components/webapp/core/KIXModulesService';
import { WidgetService } from '../../../../../../modules/base-components/webapp/core/WidgetService';
import { ObjectIcon } from '../../../../../icon/model/ObjectIcon';

export class OverlayDialogComponent implements IOverlayDialogListener {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onMount(): void {
        DialogService.getInstance().registerOverlayDialogListener(this);
        WidgetService.getInstance().setWidgetType('overlay-dialog', WidgetType.OVERLAY_DIALOG);
    }

    public open(dialogTagId?: string, input?: any, title?: string, icon?: string | ObjectIcon): void {
        this.state.dialogTemplate = KIXModulesService.getComponentTemplate(dialogTagId);
        this.state.dialogInput = input;
        this.state.title = title;
        this.state.icon = icon;
        this.state.show = true;
        this.state.loading = true;

        setTimeout(() => {
            this.state.loading = false;
        }, 200);
    }

    public close(): void {
        this.state.show = false;
    }

}

module.exports = OverlayDialogComponent;
