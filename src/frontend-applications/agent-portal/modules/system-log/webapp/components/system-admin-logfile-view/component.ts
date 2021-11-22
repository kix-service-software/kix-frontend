/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TreeHandler, TreeNode, TreeService } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { LogFile } from '../../../model/LogFile';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { LogFileProperty } from '../../../model/LogFileProperty';
import { ContextNamespace } from '../../../../../server/socket-namespaces/ContextNamespace';

class Component extends AbstractMarkoComponent<ComponentState> {

    public onCreate(): void {
        this.state = new ComponentState();
        this.state.logFileId = ContextService.getInstance().getActiveContext().getObjectId() as string;
        this.state.loadLogLevelNodes = this.loadLogLevelNodes.bind(this);
        this.state.loadWrapLinesNodes = this.loadWrapLinesNodes.bind(this);
    }

    public async onMount(): Promise<void> {
        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#View Log File',
            'Translatable#Tail Lines',
            'Translatable#Refresh Interval(sec)',
            'Translatable#Log Level',
            'Translatable#Wrap Lines',
            'Translatable#yes',
            'Translatable#no',
        ]);

        const logLevelTreeHandler = new TreeHandler([], null, null, true);
        TreeService.getInstance().registerTreeHandler(this.state.logLevelTreeId, logLevelTreeHandler);

        const wrapLinesTreeHandler = new TreeHandler([], null, null, false);
        TreeService.getInstance().registerTreeHandler(this.state.wrapLinesTreeId, wrapLinesTreeHandler);

        await this.loadLogFile();

        this.state.title = this.state.translations['Translatable#View Log File']
            + ': ' + this.state.logFile.DisplayName;

        this.setRefreshInterval();
    }

    public async loadLogLevelNodes(): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [
            new TreeNode('Info', 'Info'),
            new TreeNode('Notice', 'Notice'),
            new TreeNode('Error', 'Error'),
            new TreeNode('Debug', 'Debug')
        ];
        nodes.forEach((n) => { n.selected = true; });
        return nodes;
    }

    public async loadWrapLinesNodes(): Promise<TreeNode[]> {
        const nodes: TreeNode[] = [
            new TreeNode(true, this.getString('yes')),
            new TreeNode(false, this.getString('no')),
        ];
        nodes[0].selected = true;
        return nodes;
    }

    public logLevelFilterChanged(nodes: TreeNode[]): void {
        this.state.logLevel = [];
        nodes.forEach((n) => {
            this.state.logLevel.push(n.id);
        });
        this.loadLogFile();
    }

    public tailCountChanged(event: any): void {
        this.state.tailCount = event.target.value;
        this.loadLogFile();
    }

    public refreshIntervalChanged(event: any): void {
        this.state.refreshInterval = event.target.value;
        this.setRefreshInterval();
    }

    public wrapLinesChanged(nodes: TreeNode[]): void {
        if (nodes.length) {
            this.state.wrapLines = nodes[0].id;
        }
    }

    public filterChanged(event: any): void {
        this.state.filter = event.target.value;
        this.state.content = this.filterContent(this.state.logFile.Content);
    }

    public keydown(event: any): void {
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.filterChanged(event);
        }
    }

    public filterContent(content: string): string {
        if (content && content.length > 0 && this.state.filter && this.state.filter.length > 0) {
            const lines = content.split('\n');
            const matchingLines = lines.filter((l) => {
                const matches = l.toLowerCase().match(new RegExp(this.state.filter.toLowerCase()));
                return matches && matches.length > 0;
            });
            return matchingLines.join('\n');
        }
        return content;
    }

    public async loadLogFile(): Promise<void> {
        if (this.state.logFileId) {
            const files = await KIXObjectService.loadObjects<LogFile>(
                KIXObjectType.LOG_FILE, [this.state.logFileId],
                new KIXObjectLoadingOptions(null, null, null, [LogFileProperty.CONTENT], null, [
                    ['Tail', String(this.state.tailCount)],
                    ['Categories', this.state.logLevel.join(',')]
                ]), null, false, false
            );

            if (files && files.length) {
                this.state.logFile = files[0];
                this.state.logFile.Content = Buffer.from(this.state.logFile.Content, 'base64').toString('utf8');
                this.state.content = this.filterContent(this.state.logFile.Content);
            }
        }
    }

    public getString(pattern: string): string {
        const translation = this.state.translations['Translatable#' + pattern];
        return translation ? translation : pattern;
    }

    protected setRefreshInterval(): void {
        if (this.state.intervalId) {
            window.clearInterval(this.state.intervalId);
        }
        if (this.state.refreshInterval > 0) {
            this.state.intervalId = window.setInterval(() => {
                this.loadLogFile();
            }, this.state.refreshInterval * 1000);
        }
    }
}

module.exports = Component;
