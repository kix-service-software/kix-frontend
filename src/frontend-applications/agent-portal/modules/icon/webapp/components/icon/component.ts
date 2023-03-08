/**
 * Copyright (C) 2006-2023 c.a.p.e. IT GmbH, https://www.cape-it.de
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
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { PlaceholderService } from '../../../../base-components/webapp/core/PlaceholderService';

class Component {

    private state: ComponentState;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.icon = input.icon;
        this.state.showUnknown = typeof input.showUnknown !== 'undefined' ? input.showUnknown : false;
        this.state.tooltip = input.tooltip;
        this.setIcon(this.state.icon);
    }

    public onMount(): void {
        this.setIcon(this.state.icon);
    }

    private async setIcon(icon: ObjectIcon | string): Promise<void> {
        if (typeof icon === 'string') {
            this.state.base64 = false;
            this.state.content = icon;
        } else if (icon) {

            const context = ContextService.getInstance().getActiveContext();
            const contextObject = await context?.getObject();

            if (icon.tooltip) {
                this.state.tooltip = await PlaceholderService.getInstance().replacePlaceholders(
                    icon.tooltip, contextObject
                );
            }

            if (icon.Content) {
                if (icon.ContentType !== 'text') {
                    this.state.base64 = true;
                    this.state.contentType = icon.ContentType;
                } else {
                    this.state.base64 = false;
                }
                this.state.content = icon.Content;
            } else {
                const object = await PlaceholderService.getInstance().replacePlaceholders(
                    icon.Object, contextObject
                );
                const objectId = await PlaceholderService.getInstance().replacePlaceholders(
                    icon.ObjectId ? icon.ObjectId.toString() : '', contextObject
                );

                const icons = await KIXObjectService.loadObjects<ObjectIcon>(
                    KIXObjectType.OBJECT_ICON, null, null,
                    new ObjectIconLoadingOptions(object, objectId)
                );
                if (icons && !!icons.length) {
                    const loadedIcon = icons[0];
                    if (loadedIcon.ContentType === 'text') {
                        this.state.base64 = false;
                    } else {
                        this.state.base64 = true;
                        this.state.contentType = loadedIcon.ContentType;
                    }
                    this.state.content = loadedIcon.Content;
                } else if (icon.fallbackIcon) {
                    this.setIcon(icon.fallbackIcon);
                } else if (this.state.showUnknown) {
                    this.state.base64 = false;
                    this.state.content = 'kix-icon-unknown';
                }
            }
        }
    }

}

module.exports = Component;
