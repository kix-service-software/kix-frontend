/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Ticket } from '../../../model/Ticket';
import { TicketProperty } from '../../../model/TicketProperty';
import { SysConfigService } from '../../../../sysconfig/webapp/core';
import { TableValue } from '../../../../table/model/TableValue';
import { ITableCSSHandler } from '../../../../table/webapp/core/css-handler/ITableCSSHandler';
import { TicketService } from '../TicketService';
import { TicketColorConfiguration } from '../../../model/TicketModuleConfiguration';
import { IdService } from '../../../../../model/IdService';

export class TicketTableCSSHandler implements ITableCSSHandler<Ticket> {

    private cssClassCache: Map<string, string> = new Map();
    public static readonly TICKET_TABLE_CSS_STYLE_ID = 'TicketTableCSS';

    public async getRowCSSClasses(ticket: Ticket): Promise<string[]> {
        const classes = [];

        if (ticket) {
            const ticketModuleConfiguration = await TicketService.getTicketModuleConfiguration();
            const colorConfig = ticketModuleConfiguration.ticketColors;

            if (colorConfig) {
                const className = this.applyTicketStyles(ticket, colorConfig);
                if (className) {
                    classes.push(className);
                }
            } else {
                if (ticket.Unseen) {
                    classes.push('article-unread');
                }

                const stateTypes = await SysConfigService.getInstance().getTicketViewableStateTypes();
                if (ticket.StateType && !stateTypes?.some((t) => t === ticket.StateType)) {
                    classes.push('invalid-object');
                }
            }
        }

        return classes;
    }

    public async getValueCSSClasses(ticket: Ticket, value: TableValue): Promise<string[]> {
        const classes = [];

        if (value?.property === TicketProperty.UNSEEN) {
            classes.push('unseen');
        }

        return classes;
    }

    private applyTicketStyles(ticket: Ticket, config: TicketColorConfiguration): string {
        let styles: string[] = [];

        if (ticket.StateType) {
            if (ticket.StateType.indexOf('pending') !== -1 && this.isPendingReached(ticket)) {
                styles.push(config.stateTypes[`${ticket.StateType} reached`]);
            } else {
                styles.push(config.stateTypes[ticket.StateType]);
            }
        }

        if (ticket.State) {
            if (ticket.StateType?.indexOf('pending') !== -1 && this.isPendingReached(ticket)) {
                styles.push(config.states[`${ticket.State} reached`]);
            } else {
                styles.push(config.states[ticket.State?.toString()]);
            }
        }

        if (ticket.Unseen) {
            styles.push(config.states.unseen);
        }

        styles = styles.filter((s) => typeof s === 'string' && s !== '');

        const className = this.createCSSClass(styles);
        return className;
    }

    private createCSSClass(styles: string[]): string {
        if (styles.length) {

            const cacheKey = styles.join(';');
            if (this.cssClassCache.has(cacheKey)) {
                return this.cssClassCache.get(cacheKey);
            }

            const className = IdService.generateDateBasedId('ticket-');

            const element = this.getStyleElement();
            element.innerHTML += `.${className} { ${cacheKey} }`;

            this.cssClassCache.set(cacheKey, className);
        }
    }

    private getStyleElement(): HTMLElement {
        let element = document.getElementById(TicketTableCSSHandler.TICKET_TABLE_CSS_STYLE_ID);
        if (!element) {
            element = document.createElement('style');
            element.id = TicketTableCSSHandler.TICKET_TABLE_CSS_STYLE_ID;
            document.getElementsByTagName('head')[0].appendChild(element);
        }
        return element;
    }

    private isPendingReached(ticket: Ticket): boolean {
        const pendingDate = Date.parse(ticket.PendingTime);
        const currentDate = Date.now();
        return currentDate > pendingDate;
    }

}
