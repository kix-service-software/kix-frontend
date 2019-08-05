/**
 * Copyright (C) 2006-2019 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent, KIXObjectService } from '../../../core/browser';
import { TreeNode, KIXObjectType, DateTimeUtil } from '../../../core/model';
import { ConsoleCommand, ConsoleExecuteResult } from '../../../core/model/kix/console';
import { TranslationService } from '../../../core/browser/i18n/TranslationService';
import { ConsoleCommandProperty } from '../../../core/model/kix/console/ConsoleCommandProperty';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.state.translations = TranslationService.createTranslationObject(["Translatable#Execute"]);
        const commands = await KIXObjectService.loadObjects<ConsoleCommand>(KIXObjectType.CONSOLE_COMMAND);
        this.state.commands = commands.map((c) => new TreeNode(c, c.Command, 'kix-icon-listview'));
    }

    public commandChanged(nodes: TreeNode[]): void {
        this.state.currentCommands = nodes;
        this.state.canRun = this.state.currentCommands && this.state.currentCommands.length > 0;
    }

    public parameterChanged(event: any): void {
        this.state.parameter = event.target.value;
    }

    public keydown(event: any): void {
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.parameterChanged(event);
            this.run();
        }
    }

    public async run(): Promise<void> {
        if (this.state.parameter.toLocaleLowerCase() === 'help') {
            this.showCommandHelp(true);
        } else if (this.state.currentCommands && this.state.currentCommands.length > 0) {
            const parameterValues = this.state.parameter
                .trim()
                .split('--')
                .filter((p) => p !== '')
                .map((p) => '--' + p.trim());

            const parameters = [];
            for (const p of parameterValues) {
                if (p.match(/\s/)) {
                    const parameter = p.replace(/(--.+?)\s.*/, '$1');
                    const value = p.replace(/--.+?\s(.*)/, '$1');
                    parameters.push(parameter);
                    parameters.push(value);
                } else {
                    parameters.push(p);
                }
            }

            this.state.run = true;
            const command: ConsoleCommand = this.state.currentCommands[0].id;
            const executionDate = await DateTimeUtil.getLocalDateTimeString(Date.now());
            this.state.output = `${executionDate}: ${command.Command} ${parameters.join(' ')}`;

            await KIXObjectService.createObject(KIXObjectType.CONSOLE_COMMAND, [
                [ConsoleCommandProperty.COMMAND, command.Command],
                [ConsoleCommandProperty.PARAMETERS, parameters]
            ])
                .then((result: ConsoleExecuteResult) => {
                    this.state.output = `${this.state.output}\n\nExit Code: ${result.ExitCode}\n\n${result.Output}`;
                    this.state.run = false;
                })
                .catch(() => this.state.run = false);
        }
    }

    public showCommandHelp(all: boolean): void {
        if (all) {
            this.listCommands();
        } else if (this.state.currentCommands && this.state.currentCommands.length > 0) {
            const command: ConsoleCommand = this.state.currentCommands[0].id;
            let helpText = `Command:\t\t ${command.Command}\n\n`;
            helpText += `Description:\t\t ${command.Description}\n\n`;
            helpText += `Arguments:\t\t ${command.Arguments.join(', ')}\n\n`;
            helpText += `Parameters:\n\n`;
            for (const parameter of command.Parameters) {
                helpText += `\tName:\t\t${parameter.Name}\n`;
                helpText += `\tDescription:\t${parameter.Description}\n`;
                helpText += `\tHasValue:\t${parameter.HasValue}\n`;
                helpText += `\tRequired:\t${parameter.Required}\n\n`;
            }

            this.state.output = helpText;
        } else {
            this.listCommands();
        }
    }

    private listCommands(): void {
        const commands = this.state.commands.map((c) => {
            const cmd: ConsoleCommand = c.id;
            return `\t${cmd.Command}\n`;
        });
        this.state.output = `Commands:\n\n${commands.join('')}`;
    }

}

module.exports = Component;
