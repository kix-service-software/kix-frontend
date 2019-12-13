/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { ObjectIconLoadingOptions } from '../../../../../server/model/ObjectIconLoadingOptions';
import { ObjectIcon } from '../../../model/ObjectIcon';

class IconComponent {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.icon = input.icon;
        this.state.showUnknown = typeof input.showUnknown !== 'undefined' ? input.showUnknown : false;
        this.setIcon();
    }

    public onMount(): void {
        this.setIcon();
    }

    private async setIcon(): Promise<void> {
        if (this.state.icon instanceof ObjectIcon) {
            const icons = await KIXObjectService.loadObjects<ObjectIcon>(
                KIXObjectType.OBJECT_ICON, null, null,
                new ObjectIconLoadingOptions(this.state.icon.Object, this.state.icon.ObjectID)
            );
            if (icons && !!icons.length) {
                const icon = icons[0];
                if (icon.ContentType === 'text') {
                    this.state.base64 = false;
                } else {
                    this.state.base64 = true;
                    this.state.contentType = icon.ContentType;
                }
                this.state.content = icon.Content;
            } else if (this.state.icon.Content) {
                this.state.base64 = true;
                this.state.content = this.state.icon.Content;
                this.state.contentType = this.state.icon.ContentType;
            } else if (this.state.showUnknown) {
                this.state.base64 = false;
                this.state.content = 'kix-icon-unknown';
            }
        } else {
            this.state.base64 = false;
            this.state.content = this.state.icon;
        }
    }

}

module.exports = IconComponent;
