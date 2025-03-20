/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
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
import { TimeoutTimer } from '../../../../../base-components/webapp/core/TimeoutTimer';
import { TranslationService } from '../../../../../translation/webapp/core/TranslationService';
import { Article } from '../../../../model/Article';
import { ArticleFilter } from '../../../core/context/ArticleFilter';
import { ArticleLoader } from '../../../core/context/ArticleLoader';
import { ComponentState } from './ComponentState';

export class Component extends AbstractMarkoComponent<ComponentState> {

    private context: Context;
    private filterTimeout: any;
    private timoutTimer: TimeoutTimer;
    public isFiltered: boolean;

    public onCreate(): void {
        this.state = new ComponentState();
        this.timoutTimer = new TimeoutTimer();
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
        this.state.translations = await TranslationService.createTranslationObject(['Translatable#until', 'Translatable#since']);

        this.getSettings();
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
                        this.state.filterInternal = settingsObject.filterInternal;
                        this.state.filterCustomer = settingsObject.filterCustomer;
                        this.state.filterUnread = settingsObject.filterUnread;
                        this.state.filterValue = settingsObject.filterValue;
                    }

                    const hasFilter = this.state.filterAttachment
                        || this.state.filterExternal
                        || this.state.filterInternal
                        || this.state.filterCustomer
                        || this.state.filterUnread
                        || this.state.filterValue;

                    if (hasFilter) {
                        this.filter();
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
        } else if (type === 'internal') {
            this.state.filterInternal = !this.state.filterInternal;
        } else if (type === 'customer') {
            this.state.filterCustomer = !this.state.filterCustomer;
        } else if (type === 'unread') {
            this.state.filterUnread = !this.state.filterUnread;
        } else if (type === 'myArticles') {
            this.state.filterMyArticles = !this.state.filterMyArticles;
        }
        this.setSettings();
        this.filter();
    }

    private async filter(): Promise<void> {
        let articles: Article[] = null;

        this.isFiltered = Boolean(
            this.state.filterAttachment || this.state.filterExternal || this.state.filterInternal ||
            this.state.filterCustomer || this.state.filterUnread || this.state.filterMyArticles ||
            (this.state.filterValue && this.state.filterValue !== '') || this.state.selectedDate
        );

        if (this.isFiltered && this.context?.getObjectId()) {
            const articleFilter = new ArticleFilter(
                this.state.filterAttachment, this.state.filterExternal, this.state.filterInternal,
                this.state.filterCustomer, this.state.filterUnread, this.state.filterMyArticles,
                this.state.filterValue, this.state.isFilterDateBefore, this.state.selectedDate
            );
            articles = await ArticleLoader.searchArticles(
                Number(this.context.getObjectId()), articleFilter
            );
        }

        this.context.setFilteredObjectList(KIXObjectType.ARTICLE, articles);
    }

    private setSettings(): void {
        const ticketId = this.context?.getObjectId();
        if (ticketId) {
            const settingsObject = {
                filterAttachment: this.state.filterAttachment,
                filterExternal: this.state.filterExternal,
                filterInternal: this.state.filterInternal,
                filterCustomer: this.state.filterCustomer,
                filterUnread: this.state.filterUnread,
                filterValue: this.state.filterValue
            };
            ClientStorageService.setOption(`${ticketId}-communication-settings`, JSON.stringify(settingsObject));
        }
    }

    public selectDateOrder(): void {
        this.state.isFilterDateBefore = !this.state.isFilterDateBefore;
        this.filter();
    }

    public dateChanged(event: any): void {
        this.timoutTimer.restartTimer(() => this.setDateChanged(event));
    }

    private setDateChanged(event: any): void {
        this.state.selectedDate = event.target.value;
        this.filter();
    }
}

module.exports = Component;