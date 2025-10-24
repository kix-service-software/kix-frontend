/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { LogTier } from '../../../model/LogTier';

declare let CodeMirror: any;

class Component extends AbstractMarkoComponent<ComponentState> {

    private logFile: LogFile;
    private logLevel: string[];
    private intervalId: number;
    private codeMirror: any;

    public onCreate(input: any): void {
        super.onCreate(input);
        this.state = new ComponentState();
    }

    public async onMount(): Promise<void> {
        await super.onMount();
        this.logLevel = [];
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

        await this.initCodeEditor();
        this.state.title = `${this.state.translations['Translatable#View Log File']}: ${this.logFile?.DisplayName || ''}`;

        this.state.prepared = true;
    }

    public onDestroy(): void {
        if (this.intervalId) {
            window.clearInterval(this.intervalId);
        }
    }

    private async initCodeEditor(): Promise<void> {
        const textareaElement = (this as any).getEl(this.state.editorId);
        if (textareaElement) {
            this.codeMirror = CodeMirror.fromTextArea(
                textareaElement,
                {
                    value: '',
                    lineNumbers: true,
                    readOnly: true,
                    lineWrapping: true,
                    foldGutter: true,
                    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
                }
            );

            this.codeMirror.setSize('100%', '65vh');

            await this.loadLogFile();
            this.setRefreshInterval();
        }
    }

    public async loadLogLevelNodes(): Promise<TreeNode[]> {
        let nodes: TreeNode[] = [];
        const tier = this.context?.getAdditionalInformation('TIER');
        if (tier === LogTier.FRONTEND) {
            nodes = [
                new TreeNode('info', 'Info'),
                new TreeNode('warning', 'Warning'),
                new TreeNode('error', 'Error'),
                new TreeNode('debug', 'Debug')
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
            this.codeMirror?.setOption('lineWrapping', nodes[0].id);
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
        let lines = this.getContent()?.split('\n') || [];
        if (this.state.filter) {
            lines = lines.filter((l) => {
                const matches = l.toLowerCase().match(new RegExp(this.state.filter.toLowerCase()));
                return matches && matches.length > 0;
            });
        }

        if (this.codeMirror) {
            this.codeMirror.setValue(lines.join('\n'));
            this.codeMirror.refresh();
            const lastLine = lines?.length > 0 ? lines.length - 1 : 0;
            this.codeMirror.scrollIntoView({ line: lastLine, char: 0 }, 10);
        }
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

    public onInput(input: any): void {
        super.onInput(input);
    }
}

module.exports = Component;
