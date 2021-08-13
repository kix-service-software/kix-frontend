/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { ContextHistoryEntry } from './ContextHistoryEntry';
import { RoutingService } from './RoutingService';
import { Context } from '../../../../model/Context';
import { EventService } from './EventService';
import { ContextUIEvent } from './ContextUIEvent';

export class ContextHistory {

    private static INSTANCE: ContextHistory;

    public static getInstance(): ContextHistory {
        if (!ContextHistory.INSTANCE) {
            ContextHistory.INSTANCE = new ContextHistory();
        }
        return ContextHistory.INSTANCE;
    }

    private contextHistory: ContextHistoryEntry[] = [];

    private constructor() {
        window.addEventListener('popstate', (event) => {
            event.preventDefault();
            this.navigateBack(event);
        });

        window.addEventListener('beforeunload', this.beforeunload.bind(this));
    }

    public removeBrowserListener(): void {
        window.removeEventListener('beforeunload', this.beforeunload.bind(this));
    }

    private beforeunload(event: any): any {
        event.returnValue = false;
        return false;
    }

    private navigateBack(event: any): void {
        if (event && event.state) {
            RoutingService.getInstance().routeToURL(false);
        }
    }

    public async addHistoryEntry(context: Context): Promise<void> {
        if (context) {
            const entry = this.contextHistory.find(
                (he) => he.contextId === context.contextId && he.objectId === context.getObjectId()
            );

            const displayText = await context.getDisplayText();

            if (entry) {
                entry.displayText = displayText;
                entry.lastVisitDate = new Date().getTime();
            } else {
                const newEntry = new ContextHistoryEntry(
                    context.getIcon(),
                    displayText,
                    context.contextId,
                    context.getObjectId(),
                    context.descriptor,
                    new Date().getTime()
                );
                this.contextHistory.push(newEntry);
            }
            EventService.getInstance().publish(ContextUIEvent.HISTORY_CHANGED);
        }
    }

    public getHistory(limit: number, currentContext: Context): ContextHistoryEntry[] {
        const history = [];
        if (currentContext) {
            this.contextHistory
                .sort((a, b) => b.lastVisitDate - a.lastVisitDate)
                .forEach((he) => {
                    if (he.contextId !== currentContext.descriptor?.contextId ||
                        he.objectId !== currentContext.getObjectId()
                    ) {
                        if (!history.some((h) =>
                            he.contextId === currentContext.descriptor?.contextId &&
                            he.objectId === currentContext.getObjectId()
                        )) {
                            history.push(he);
                        }
                    }
                });
        }
        return history.slice(0, limit > 0 ? limit : this.contextHistory.length);
    }

}
