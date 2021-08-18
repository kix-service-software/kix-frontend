/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { IConfiguration } from '../../../../../../model/configuration/IConfiguration';
import { WidgetSize } from '../../../../../../model/configuration/WidgetSize';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { AbstractMarkoComponent } from '../../../core/AbstractMarkoComponent';
import { ActionFactory } from '../../../core/ActionFactory';
import { KIXModulesService } from '../../../core/KIXModulesService';
import { TreeHandler, TreeNode, TreeService, TreeUtil } from '../../../core/tree';
import { ComponentState } from './ComponentState';

class Component extends AbstractMarkoComponent<ComponentState> {

    private titleTimeout: any;
    private actionsTreeHandler: TreeHandler;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        this.state.widget = { ...input.widget };
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject(
            ['Translatable#Small Widget', 'Translatable#Advanced', 'Translatable#Standard']
        );

        this.state.settingsLabel = this.state.translations['Translatable#Advanced'];

        this.prepareActionNodes();
    }

    public onDestroy(): void {
        TreeService.getInstance().removeTreeHandler(this.state.actionsTreeId);
    }

    private async prepareActionNodes(): Promise<void> {
        const actions = await ActionFactory.getInstance().getActionsForConfigurationType(
            this.state.widget.configuration?.configuration?.type
        );
        const configuredActions = this.state.widget.configuration.actions;

        const nodes: TreeNode[] = [];

        for (const a of actions) {
            const text = await TranslationService.translate(a.text);
            nodes.push(new TreeNode(a.id, text, a.icon));
        }

        this.actionsTreeHandler = new TreeHandler([], null);
        TreeService.getInstance().registerTreeHandler(this.state.actionsTreeId, this.actionsTreeHandler);

        if (this.actionsTreeHandler) {
            this.actionsTreeHandler.setTree(nodes, null, true);
            const selectedNodes: TreeNode[] = [];
            for (const a of configuredActions) {
                const node = nodes.find((n) => n.id === a);
                const text = node ? node.label : a;
                const icon = node ? node.icon : null;
                selectedNodes.push(new TreeNode(a, text, icon));
            }
            this.actionsTreeHandler.setSelection(selectedNodes, true);
        }
    }

    public minimize(event: any): void {
        if (event.srcElement?.id === `widget-header-${this.state.widget.instanceId}`) {
            this.state.minimized = !this.state.minimized;
        }
    }

    public removeWidget(event: any): void {
        (this as any).emit('removeWidget', this.state.widget);
    }

    public toggleAdvancedMode(event: any): void {
        this.state.advancedSettings = !this.state.advancedSettings;

        this.state.settingsLabel = this.state.advancedSettings
            ? this.state.translations['Translatable#Standard']
            : this.state.translations['Translatable#Advanced'];
    }

    public getConfigurationComponent(): any {
        const widgetConfiguration = this.state.widget.configuration;
        return KIXModulesService.getConfigurationComponentTemplate(widgetConfiguration.configuration?.type);
    }

    private emitConfigurationChanged(): void {
        (this as any).emit('configurationChanged', this.state.widget);
    }

    public configurationChanged(configuration: IConfiguration): void {
        this.state.widget.configuration.configuration = configuration;
        this.emitConfigurationChanged();
    }
    public getTitle(): string {
        return this.state.widget.configuration.title.replace('Translatable#', '');
    }

    public titleChanged(event: any): void {
        if (this.titleTimeout) {
            window.clearTimeout(this.titleTimeout);
        }
        this.titleTimeout = setTimeout(() => {
            this.state.widget.configuration.title = event.target.value;
            this.emitConfigurationChanged();
        }, 50);
    }

    public actionsChanged(nodes: TreeNode[]): void {
        this.state.widget.configuration.actions = nodes.map((n) => n.id);
        this.emitConfigurationChanged();
    }

    public widgetSizeChanged(): void {
        this.state.widget.size = this.state.widget.size === WidgetSize.SMALL
            ? WidgetSize.LARGE
            : WidgetSize.SMALL;
        this.emitConfigurationChanged();
    }

    public minimizableChanged(): void {
        this.state.widget.configuration.minimizable = !this.state.widget.configuration.minimizable;
        this.state.isMinimizeEnabled = this.state.widget.configuration.minimizable;

        if (!this.state.isMinimizeEnabled) {
            this.state.widget.configuration.minimized = false;
        }

        this.emitConfigurationChanged();
    }

    public minimizedChanged(): void {
        this.state.widget.configuration.minimized = !this.state.widget.configuration.minimized;
        this.emitConfigurationChanged();
    }

}

module.exports = Component;
