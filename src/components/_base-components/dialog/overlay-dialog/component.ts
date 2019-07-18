/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ObjectIcon, WidgetType } from '../../../../core/model';
import { WidgetService } from '../../../../core/browser';
import { IOverlayDialogListener, DialogService } from '../../../../core/browser/components/dialog';
import { KIXModulesService } from '../../../../core/browser/modules';

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

    public setLoading(loading: boolean): void {
        this.state.loading = loading;
    }

}

module.exports = OverlayDialogComponent;
