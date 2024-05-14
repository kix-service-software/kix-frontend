/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../../../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { LabelService } from '../../../../../../../../base-components/webapp/core/LabelService';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {


    public onCreate(input: any): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.cell = input.cell;
        this.update();
    }

    private async update(): Promise<void> {
        const config = this.state.cell?.getColumnConfiguration();
        this.state.showIcons = config?.showIcon;
        this.state.showText = config?.showText;
        this.state.rtl = config?.rtl;
        await this.getOverlay();
    }

    public onDestroy(): void {
        // nothing
    }

    private async getOverlay(): Promise<void> {
        const object = this.state.cell.getRow().getRowObject().getObject();

        if (object?.KIXObjectType) {
            const value = this.state.cell.getValue();
            if (value?.objectValue && Number(value?.objectValue)) {
                this.state.overlay = await LabelService.getInstance().getOverlayIconForType(
                    object?.KIXObjectType, value.objectValue, value.property
                );
            }
        }
    }

}

module.exports = Component;
