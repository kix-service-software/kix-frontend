/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Context } from '../../../../../../model/Context';
import { KIXObjectType } from '../../../../../../model/kix/KIXObjectType';
import { AbstractMarkoComponent } from '../../../../../base-components/webapp/core/AbstractMarkoComponent';
import { ClientStorageService } from '../../../../../base-components/webapp/core/ClientStorageService';
import { ContextService } from '../../../../../base-components/webapp/core/ContextService';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { Article } from '../../../../model/Article';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;
    private filterTimeout: any;

    public onCreate(): void {
        this.state = new ComponentState();
    }

    public onInput(input: any): void {
        return;
    }

    public async onMount(): Promise<void> {
        this.context = ContextService.getInstance().getActiveContext();

        this.context.registerListener('communication-widget-filter', {
            filteredObjectListChanged: () => null,
            objectListChanged: (objectType: KIXObjectType) => {
                if (objectType === KIXObjectType.ARTICLE) {
                    this.filter();
                }
            },
            additionalInformationChanged: () => null,
            objectChanged: () => null,
            scrollInformationChanged: () => null,
            sidebarLeftToggled: () => null,
            sidebarRightToggled: () => null
        });

        this.state.searchPlaceholder = await TranslationService.translate('Search');

        this.getSettings();
        this.filter();
    }

    private getSettings(): void {
        const ticketId = this.context?.getObjectId();
        if (ticketId) {
            const settings = ClientStorageService.getOption(`${ticketId}-communication-settings`);
            if (settings) {
                try {
                    const settingsObject = JSON.parse(settings);
                    if (typeof settingsObject === 'object') {
                        this.state.filterAttachment = settingsObject.filterAttachment;
                        this.state.filterExternal = settingsObject.filterExternal;
                        this.state.filterCustomer = settingsObject.filterCustomer;
                        this.state.filterUnread = settingsObject.filterUnread;
                        this.state.filterValue = settingsObject.filterValue;
                    }
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }

    public onDestroy(): void {
        this.context.unregisterListener('communication-widget-filter');
    }

    public keyDown(event: any): void {
        if (event.keyCode === 13 || event.key === 'Enter') {
            this.state.filterValue = event.target.value;

            if (this.filterTimeout) {
                window.clearTimeout(this.filterTimeout);
            }

            this.filterTimeout = setTimeout(() => this.filter(), 250);
        }
    }

    public filterChanged(type: string): void {
        if (type === 'attachment') {
            this.state.filterAttachment = !this.state.filterAttachment;
        } else if (type === 'external') {
            this.state.filterExternal = !this.state.filterExternal;
        } else if (type === 'customer') {
            this.state.filterCustomer = !this.state.filterCustomer;
        } else if (type === 'unread') {
            this.state.filterUnread = !this.state.filterUnread;
        }
        this.filter();
    }

    private async filter(): Promise<void> {
        let articles = [...await this.context?.getObjectList<Article>(KIXObjectType.ARTICLE) || []];

        if (this.state.filterAttachment) {
            articles = articles.filter((a) => Array.isArray(a.Attachments) && a.Attachments.length);
        }

        if (this.state.filterExternal) {
            articles = articles.filter((a) => a.SenderType === 'external');
        }

        if (this.state.filterCustomer) {
            articles = articles.filter((a) => a.CustomerVisible);
        }

        if (this.state.filterUnread) {
            articles = articles.filter((a) => a.isUnread());
        }

        if (this.state.filterValue && this.state.filterValue !== '') {
            articles = articles.filter((a) => {
                return a.Body.match(new RegExp(this.state.filterValue, 'ig')) ||
                    a.Subject.match(new RegExp(this.state.filterValue, 'ig')) ||
                    a.To.match(new RegExp(this.state.filterValue, 'ig')) ||
                    a.Cc.match(new RegExp(this.state.filterValue, 'ig')) ||
                    a.From.match(new RegExp(this.state.filterValue, 'ig'));
            });
        }

        this.setSettings();
        this.context.setFilteredObjectList(KIXObjectType.ARTICLE, articles);
    }

    private setSettings(): void {
        const ticketId = this.context?.getObjectId();
        if (ticketId) {
            const settingsObject = {
                filterAttachment: this.state.filterAttachment,
                filterExternal: this.state.filterExternal,
                filterCustomer: this.state.filterCustomer,
                filterUnread: this.state.filterUnread,
                filterValue: this.state.filterValue
            };
            ClientStorageService.setOption(`${ticketId}-communication-settings`, JSON.stringify(settingsObject));
        }
    }
}

module.exports = Component;