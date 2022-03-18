/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ComponentState } from './ComponentState';
import { AbstractMarkoComponent } from '../../../../../modules/base-components/webapp/core/AbstractMarkoComponent';
import { TreeNode } from '../../../../base-components/webapp/core/tree';
import { TranslationService } from '../../../../../modules/translation/webapp/core/TranslationService';
import { LogFile } from '../../../model/LogFile';
import { KIXObjectService } from '../../../../base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../../../../model/kix/KIXObjectType';
import { KIXObjectLoadingOptions } from '../../../../../model/KIXObjectLoadingOptions';
import { LogFileProperty } from '../../../model/LogFileProperty';
import { Context } from '../../../../../model/Context';
import { ContextService } from '../../../../base-components/webapp/core/ContextService';
import { LogTier } from '../../../model/LogTier';

class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;
    private logFile: LogFile;
    private logLevel: string[];
    private intervalId: number;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        this.logLevel = [];
        this.context = ContextService.getInstance().getActiveContext();
        this.state.loadLogLevelNodes = this.loadLogLevelNodes.bind(this);
        this.state.loadWrapLinesNodes = this.loadWrapLinesNodes.bind(this);

        this.state.translations = await TranslationService.createTranslationObject([
            'Translatable#View Log File',
            'Translatable#Tail Lines',
            'Translatable#Refresh Interval(sec)',
            'Translatable#Log Level',
            'Translatable#Wrap Lines',
            'Translatable#yes',
            'Translatable#no',
            'Translatable#Filter Log Level'
        ]);

        await this.loadLogFile();

        this.state.title = this.state.translations['Translatable#View Log File']
            + ': ' + this.logFile.DisplayName;

        this.setRefreshInterval();

        this.state.prepared = true;
    }

    public onDestroy(): void {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
        }
    }

    public async loadLogLevelNodes(): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        const tier = this.context?.getAdditionalInformation('TIER');
        if (tier === LogTier.FRONTEND) {
            nodes = [
                new TreeNode(' - info: ', 'Info'),
                new TreeNode(' - warning: ', 'Warning'),
                new TreeNode(' - error: ', 'Error'),
                new TreeNode(' - debug: ', 'Debug')
            ];
        } else {
            nodes = [
                new TreeNode('Info', 'Info'),
                new TreeNode('Notice', 'Notice'),
                new TreeNode('Error', 'Error'),
                new TreeNode('Debug', 'Debug')
            ];
        }
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
        const tier = this.context.getAdditionalInformation('TIER');

        this.logLevel = tier === LogTier.FRONTEND && nodes.length === this.logLevel.length
            ? []
            : nodes.map((n) => n.id);

        this.context.setAdditionalInformation('LOG_LEVEL', this.logLevel);
        this.loadLogFile();
    }

    public tailCountChanged(event: any): void {
        this.state.tailCount = event.target.value;
        this.context.setAdditionalInformation('TAIL_COUNT', this.logLevel);
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
        this.filterContent();
    }

    public keydown(event: any): void {
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.filterChanged(event);
        }
    }

    public filterContent(): void {
        let content = this.getContent();
        if (content && this.state.filter) {
            const lines = content.split('\n');
            const matchingLines = lines.filter((l) => {
                const matches = l.toLowerCase().match(new RegExp(this.state.filter.toLowerCase()));
                return matches && matches.length > 0;
            });
            content = matchingLines.join('\n');
        }

        this.state.content = content;
    }

    private getContent(): string {
        return Buffer.from(this.logFile?.Content, 'base64').toString('utf8');
    }

    public async loadLogFile(): Promise<void> {
        const logFileId = this.context.getObjectId();
        if (logFileId) {
            const tier = this.context.getAdditionalInformation('TIER') || LogTier.BACKEND;
            const files = await KIXObjectService.loadObjects<LogFile>(
                KIXObjectType.LOG_FILE, [logFileId],
                new KIXObjectLoadingOptions(null, null, null, [LogFileProperty.CONTENT], null, [
                    ['Tail', String(this.state.tailCount)],
                    ['Categories', this.logLevel.join(',')],
                    ['tier', tier]
                ]), null, false, false
            );

            if (files && files.length) {
                this.logFile = files[0];
                this.filterContent();
            }
        }
    }

    public getString(pattern: string): string {
        const translation = this.state.translations['Translatable#' + pattern];
        return translation ? translation : pattern;
    }

    protected setRefreshInterval(): void {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
        }
        if (this.state.refreshInterval > 0) {
            this.intervalId = window.setInterval(() => {
                this.loadLogFile();
            }, this.state.refreshInterval * 1000);
        }
    }
}

module.exports = Component;
