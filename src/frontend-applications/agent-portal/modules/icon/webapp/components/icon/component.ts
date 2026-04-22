/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ObjectIcon } from '../../../model/ObjectIcon';
import { PlaceholderService } from '../../../../base-components/webapp/core/PlaceholderService';
import { AbstractMarkoComponent } from '../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ObjectIconService } from '../../core';

class Component extends AbstractMarkoComponent<ComponentState> {

    private icon: ObjectIcon;
    private object: string;
    private objectId: string;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        super.onInput(input);
        this.icon = input.icon;
        this.state.showUnknown = typeof input.showUnknown !== 'undefined' ? input.showUnknown : false;
        this.state.tooltip = input.tooltip;
        this.setIcon(this.icon);
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.setIcon(this.icon);
    }

    private async setIcon(icon: ObjectIcon | string): Promise<void> {
        if (typeof icon === 'string') {
            this.state.base64 = false;
            this.state.content = icon;
            this.state.srcPath = null;
            this.state.contentType = null;
        } else if (icon) {

            const contextObject = await this.context?.getObject();

            if (icon.tooltip) {
                this.state.tooltip = await PlaceholderService.getInstance().replacePlaceholders(
                    icon.tooltip, contextObject
                );
            }

            if (!this.setIconByContent(icon)) {
                this.object = await PlaceholderService.getInstance().replacePlaceholders(
                    icon.Object, contextObject
                );
                this.objectId = await PlaceholderService.getInstance().replacePlaceholders(
                    icon.ObjectId ? icon.ObjectId.toString() : '', contextObject
                );

                const objectIcon = await ObjectIconService.getInstance().getObjectIcon(this.object, this.objectId);
                if (objectIcon) {
                    this.state.base64 = false;
                    this.state.contentType = objectIcon.ContentType;
                    if (objectIcon.ContentType === 'text') {
                        this.state.content = objectIcon.Content;
                        this.state.srcPath = null;
                    }
                    else {
                        this.state.srcPath = ObjectIconService.getObjectIconUrl(
                            objectIcon.ID, objectIcon.ContentType
                        );
                        this.state.content = null;
                    }
                } else {
                    this.setFallback();
                }
            }
        }
    }

    private setIconByContent(icon: ObjectIcon): boolean {
        if (icon.Content !== undefined && icon.Content !== null) {
            if (icon.ContentType === 'text') {
                this.state.base64 = false;
                this.state.content = icon.Content;
                this.state.contentType = null;
                this.state.srcPath = null;
                return true;
            }
            else {
                this.state.base64 = true;
                this.state.content = icon.Content;
                this.state.contentType = icon.ContentType;
                this.state.srcPath = null;
                return true;
            }
        }
        return false;
    }


    public onDestroy(): void {
        super.onDestroy();
    }

    public async setFallback(): Promise<void> {
        if (this.icon.fallbackIcon) {
            this.setIcon(this.icon.fallbackIcon);
        } else if (this.state.showUnknown) {
            this.state.base64 = false;
            this.state.content = 'kix-icon-unknown';
            this.state.contentType = null;
            this.state.srcPath = null;
        }
    }
}

module.exports = Component;
