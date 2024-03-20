/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { ComponentInput } from './ComponentInput';

import { ObjectIcon } from '../../../../icon/model/ObjectIcon';
import { LabelService } from '../../core/LabelService';
import { ContextService } from '../../core/ContextService';

export class ObjectPropertyLabelComponent {

    private state: ComponentState;

    private object: any;
    private property: string;

    private displayIcon: ObjectIcon | string;
    private propertyText: string;
    private displayText: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: ComponentInput): void {
        this.property = input.property;
        this.displayIcon = input.displayIcon;
        this.propertyText = input.propertyText;
        this.displayText = input.displayText;
        this.state.hasText = typeof input.showText !== 'undefined' ? input.showText : true;
        this.state.showLabel = typeof input.showLabel !== 'undefined' ? input.showLabel : true;
        if (this.object !== input.object) {
            this.object = input.object;
            this.prepareDisplayText();
            this.prepareOverlayIcon();
        }
    }

    public onMount(): void {
        this.prepareDisplayText();
        this.preparePropertyName();
    }

    private async prepareDisplayText(): Promise<void> {
        this.state.propertyDisplayText = await this.getPropertyDisplayText();
        this.state.propertyIcon = await this.getIcon();
    }

    private async preparePropertyName(): Promise<void> {
        if (this.propertyText) {
            this.state.propertyName = this.propertyText;
        } else if (this.property) {
            if (!this.object) {
                const context = ContextService.getInstance().getActiveContext();
                this.object = await context.getObject();
            }

            let name = await LabelService.getInstance().getPropertyText(this.property, this.object.KIXObjectType);
            if (name === null) {
                name = this.property;
            }
            this.state.propertyName = name;
        }
    }

    private async getIcon(): Promise<string | ObjectIcon> {
        let icon: string | ObjectIcon;
        if (this.displayIcon) {
            icon = this.displayIcon;
        } else if (this.property) {
            if (!this.object) {
                const context = ContextService.getInstance().getActiveContext();
                this.object = await context.getObject();
            }

            const icons = await LabelService.getInstance().getIcons(this.object, this.property);
            if (icons && icons.length) {
                icon = icons[0];
            }
        }
        return icon;
    }

    private async getPropertyDisplayText(): Promise<string> {
        if (this.displayText) {
            return this.displayText;
        }

        if (!this.object) {
            const context = ContextService.getInstance().getActiveContext();
            this.object = await context.getObject();
        }

        if (this.object && this.property) {
            let displayText = await LabelService.getInstance().getDisplayText(this.object, this.property);
            if (displayText === null) {
                displayText = this.object[this.property];
            }
            return displayText;
        }
        return this.property;
    }

    public getValueClasses(): string {
        const classes = LabelService.getInstance().getDisplayTextClasses(this.object, this.property);
        return classes ? classes.join(',') : '';
    }

    private async prepareOverlayIcon(): Promise<void> {
        if (this.object && this.property) {
            const overlay = await LabelService.getInstance().getOverlayIcon(
                this.object, this.property, this.object[this.property]
            );
            if (overlay !== null) {
                this.state.overlay = overlay;
            }
        }
    }

}

module.exports = ObjectPropertyLabelComponent;
