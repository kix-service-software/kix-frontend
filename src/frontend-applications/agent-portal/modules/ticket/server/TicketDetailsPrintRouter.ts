/**
 * Copyright (C) 2006-2021 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

import { Request, Response } from 'express';
import { KIXRouter } from '../../../server/routes/KIXRouter';
import { TicketDetailsDataBuilder } from './TicketDetailsDataBuilder';
import { AuthenticationService } from '../../../server/services/AuthenticationService';

export class TicketDetailsPrintRouter extends KIXRouter {

    private static INSTANCE: TicketDetailsPrintRouter;

    public static getInstance(): TicketDetailsPrintRouter {
        if (!TicketDetailsPrintRouter.INSTANCE) {
            TicketDetailsPrintRouter.INSTANCE = new TicketDetailsPrintRouter();
        }
        return TicketDetailsPrintRouter.INSTANCE;
    }

    private constructor() {
        super();
    }

    public getBaseRoute(): string {
        return '/tickets';
    }

    protected initialize(): void {
        this.router.get(
            '/:objectId/print',
            AuthenticationService.getInstance().isAuthenticated.bind(AuthenticationService.getInstance()),
            this.getPrintComponent.bind(this)
        );
    }

    private async getPrintComponent(req: Request, res: Response): Promise<void> {
        const token: string = req.cookies.token;
        const favIcon = await this.getIcon('agent-portal-icon');
        const data = await TicketDetailsDataBuilder.buildTicketData(token, Number(req.params.objectId));
        const template = require('../webapp/components/ticket-details-print');
        (res as any).marko(template, { favIcon, ...data });
    }

}
