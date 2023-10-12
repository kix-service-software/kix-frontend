/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { ConsoleCommand } from '../../../model/ConsoleCommand';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { DateTimeUtil } from '../../../../../modules/base-components/webapp/core/DateTimeUtil';
import { ConsoleCommandProperty } from '../../../model/ConsoleCommandProperty';
import { ConsoleExecuteResult } from '../../../model/ConsoleExecuteResult';
import { KIXObjectService } from '../../../../../modules/base-components/webapp/core/KIXObjectService';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';

class Component extends AbstractMarkoComponent<ComponentState> {

    private commands: ConsoleCommand[];
    private command: ConsoleCommand;

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.loadNodes = this.load.bind(this);
    }

    public async load(): Promise<TreeNode[]> {
        this.commands = await KIXObjectService.loadObjects<ConsoleCommand>(KIXObjectType.CONSOLE_COMMAND);
        const nodes = this.commands.map((c) => new TreeNode(c.Command, c.Command, 'kix-icon-listview'));
        return nodes;
    }

    public async onMount(): Promise<void> {
        this.state.translations = TranslationService.createTranslationObject(['Translatable#Execute']);
    }

    public commandChanged(nodes: TreeNode[]): void {
        if (nodes && nodes.length) {
            this.command = this.commands.find((c) => c.Command === nodes[0].id);
            this.state.canRun = this.command !== null;
        }
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
        } else if (this.command) {
            const parameters = this.parseParameters(this.state.parameter);

            this.state.run = true;
            const executionDate = await DateTimeUtil.getLocalDateTimeString(Date.now());
            this.state.output = `${executionDate}: ${this.command.Command} ${parameters.join(' ')}`;

            await KIXObjectService.createObject(KIXObjectType.CONSOLE_COMMAND, [
                [ConsoleCommandProperty.COMMAND, this.command.Command],
                [ConsoleCommandProperty.PARAMETERS, parameters]
            ]).then((result: ConsoleExecuteResult) => {
                this.state.output = `${this.state.output}\n\nExit Code: ${result.ExitCode}\n\n${result.Output}`;
                this.state.run = false;
            }).catch(() => this.state.run = false);
        }
    }

    private parseParameters(paramString: string): string[][] {
        const textSeparator: string = '["\']';
        const paramSeparator: string = ' ';
        const list = [];
        let quote: string = null;

        for (let column = 0, character = 0; character < paramString.length; character++) {
            const currentCharacter = paramString[character];
            list[column] = list[column] || '';

            if (currentCharacter.match(new RegExp(textSeparator))) {
                if (quote && currentCharacter === quote) {
                    quote = null;
                    continue;
                }
                if (!quote) {
                    quote = currentCharacter;
                    continue;
                }
                // no continue here!! - keep "not" quote textSeparator
            }

            if (currentCharacter.match(new RegExp(paramSeparator)) && !quote) { ++column; continue; }

            list[column] += currentCharacter;
        }

        return list.filter((v) => v !== '');
    }

    public showCommandHelp(all: boolean): void {
        if (all) {
            this.listCommands();
        } else if (this.command) {
            let helpText = `Command:\t\t ${this.command.Command}\n\n`;
            helpText += `Description:\t\t ${this.command.Description}\n\n`;
            helpText += 'Arguments:\n\n';
            for (const argument of this.command.Arguments) {
                helpText += `\tName:\t\t${argument.Name}\n`;
                helpText += `\tDescription:\t${argument.Description}\n`;
                helpText += `\tRequired:\t${argument.Required || 0}\n\n`;
            }
            helpText += 'Parameters:\n\n';
            for (const parameter of this.command.Parameters) {
                helpText += `\tName:\t\t${parameter.Name}\n`;
                helpText += `\tDescription:\t${parameter.Description}\n`;
                helpText += `\tHasValue:\t${parameter.HasValue || 0}\n`;
                helpText += `\tRequired:\t${parameter.Required || 0}\n\n`;
            }
            if (this.command.AdditionalHelp) {
                helpText += 'Additional help:\n\n\t';
                helpText += this.command.AdditionalHelp.replace(/\n/g, '\n\t')
                    .replace(/<\/?yellow>/g, '"')
                    .replace(/<green>/g, '>>').replace(/<\/green>/g, '<<');
                helpText += '\n\n';
            }

            this.state.output = helpText;
        } else {
            this.listCommands();
        }
    }

    private listCommands(): void {
        const commands = this.commands.map((c) => `\t${c.Command} \n`);
        this.state.output = `Commands: \n\n${commands.join('')} `;
    }

}

module.exports = Component;
