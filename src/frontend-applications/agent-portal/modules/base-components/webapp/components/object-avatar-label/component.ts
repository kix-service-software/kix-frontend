/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { AbstractMarkoComponent } from '../../core/AbstractMarkoComponent';
import { ContextService } from '../../core/ContextService';
import { LabelService } from '../../core/LabelService';
import { PlaceholderService } from '../../core/PlaceholderService';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private property: string;
    private text: string;
    private description: string;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.property = input.property;
        this.text = input.text;
        this.description = input.description;
        this.state.icon = input.icon;
        this.update();
    }

    public async onMount(): Promise<void> {
        this.update();
    }

    private async update(): Promise<void> {
        const context = ContextService.getInstance().getActiveContext();
        const contextObject = await context.getObject();
        if (contextObject) {
            if (this.property) {

                this.state.displayText = await LabelService.getInstance().getDisplayText(
                    contextObject, this.property
                );

                const icons = await LabelService.getInstance().getIcons(contextObject, this.property);
                if (Array.isArray(icons) && icons.length) {
                    this.state.icon = icons[0];
                }

                this.state.description = await LabelService.getInstance().getPropertyText(
                    this.property, contextObject.KIXObjectType
                );
            } else {
                this.state.displayText = await PlaceholderService.getInstance().replacePlaceholders(
                    this.text, contextObject
                );

                this.state.description = await PlaceholderService.getInstance().replacePlaceholders(
                    this.description, contextObject
                );
            }
        }
    }
}

module.exports = Component;
