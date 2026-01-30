/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { LabelService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { User } from '../../src/frontend-applications/agent-portal/modules/user/model/User';
import { DateTimeUtil } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/DateTimeUtil';
import { UserLabelProvider } from '../../src/frontend-applications/agent-portal/modules/user/webapp/core/UserLabelProvider';
import { KIXObjectService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/KIXObjectService';
import { OutOfOffice } from '../../src/frontend-applications/agent-portal/modules/user/model/OutOfOffice';
import { OutOfOfficeProperty } from '../../src/frontend-applications/agent-portal/modules/user/model/OutOfOfficeProperty';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('LabelService', () => {
    let oooUser: User, oooUserFuture: User, user: User, orgLoadFunction, orgGetObjectTypeFunction;
    before('Should register handler', () => {
        const start = new Date(), end = new Date();
        start.setDate((start).getDate() - 4);
        end.setDate((end).getDate() + 2);
        oooUser = new User();
        oooUser.KIXObjectType = KIXObjectType.USER;
        oooUser.IsAgent = 1;
        oooUser.UserID = 1;
        oooUser.OutOfOffice = new OutOfOffice();
        oooUser.OutOfOffice.Start = DateTimeUtil.getKIXDateString(start);
        oooUser.OutOfOffice.End = DateTimeUtil.getKIXDateString(end);

        const startFuture = new Date(), endFuture = new Date();
        startFuture.setDate((startFuture).getDate() + 7);
        endFuture.setDate((endFuture).getDate() + 14);
        oooUserFuture = new User();
        oooUserFuture.KIXObjectType = KIXObjectType.USER;
        oooUserFuture.IsAgent = 1;
        oooUserFuture.UserID = 2;
        oooUserFuture.OutOfOffice = new OutOfOffice();
        oooUserFuture.OutOfOffice.Start = DateTimeUtil.getKIXDateString(startFuture);
        oooUserFuture.OutOfOffice.End = DateTimeUtil.getKIXDateString(endFuture);

        user = new User();
        user.KIXObjectType = KIXObjectType.USER;
        user.IsAgent = 1;
        user.UserID = 3;

        orgLoadFunction = KIXObjectService.loadObjects;
        orgGetObjectTypeFunction = KIXObjectService.getObjectTypeForProperty;
        KIXObjectService.loadObjects = async <T>(objectType: KIXObjectType | string, objectIds?: Array<number | string>): Promise<T> => {
            let objects;
            if (objectType === KIXObjectType.USER && objectIds) {
                if (objectIds[0] === 1) {
                    objects = [oooUser];
                } else if (objectIds[0] === 2) {
                    objects = [oooUserFuture];
                } else {
                    objects = [user];
                }
            }
            return objects;
        };
        KIXObjectService.getObjectTypeForProperty = async (objectType: KIXObjectType | string, property: string, useOwnTypeFallback: boolean = true): Promise<KIXObjectType | string> => {
            if (objectType === KIXObjectType.USER && property === 'SomeTestProperty' && !useOwnTypeFallback) {
                return KIXObjectType.USER;
            }
            return '';
        };
    });

    after(() => {
        KIXObjectService.loadObjects = orgLoadFunction;
        KIXObjectService.getObjectTypeForProperty = orgGetObjectTypeFunction;
    });

    describe('getOverlayIcon', () => {
        before('Should register handler', () => {
            LabelService.getInstance().registerLabelProvider(new UserLabelProvider());
        });
        it('overlay / ObjectType: unknonw / should be null', async () => {
            const overlay = await LabelService.getInstance().getOverlayIcon('unknown', oooUser.UserID);
            expect(overlay).to.be.null
        });
        it('overlay / ObjectType: User / Without OutOfOffice / should be null', async () => {
            const overlay = await LabelService.getInstance().getOverlayIcon(KIXObjectType.USER, user.UserID);
            expect(overlay).to.be.null
        });
        it('overlay / ObjectType: User / With OutOfOffice / should be an overlay object', async () => {
            const overlay = await LabelService.getInstance().getOverlayIcon(KIXObjectType.USER, oooUser.UserID) || {};
            expect(overlay).to.be.deep.property('Data', {
                KIXObjectType: KIXObjectType.USER,
                Start: oooUser.OutOfOffice.Start,
                End: oooUser.OutOfOffice.End,
                Substitute: null,
                Properties: [
                    OutOfOfficeProperty.START,
                    OutOfOfficeProperty.END,
                    OutOfOfficeProperty.SUBSTITUTE
                ]
            });
        });
        it('overlay / ObjectType: User / With OutOfOffice in future / should be null', async () => {
            const overlay = await LabelService.getInstance().getOverlayIcon(KIXObjectType.USER, oooUserFuture.UserID);
            expect(overlay).to.be.null
        });
    });
    describe('getOverlayIconByProperty', () => {
        before('Should register handler', () => {
            LabelService.getInstance().registerLabelProvider(new UserLabelProvider());
        });
        it('overlay / ObjectType: unknown / should be null', async () => {
            const overlay = await LabelService.getInstance().getOverlayIconByProperty('unknown', 'SomeTestProperty', oooUser.UserID);
            expect(overlay).to.be.null
        });
        it('overlay / ObjectType: User / Without OutOfOffice / should be null', async () => {
            const overlay = await LabelService.getInstance().getOverlayIconByProperty(KIXObjectType.USER, 'SomeTestProperty', user.UserID);
            expect(overlay).to.be.null
        });
        it('overlay / ObjectType: User / With OutOfOffice / should be an overlay object', async () => {
            const overlay = await LabelService.getInstance().getOverlayIconByProperty(KIXObjectType.USER, 'SomeTestProperty', oooUser.UserID) || {};
            expect(overlay).to.be.deep.property('Data', {
                KIXObjectType: KIXObjectType.USER,
                Start: oooUser.OutOfOffice.Start,
                End: oooUser.OutOfOffice.End,
                Substitute: null,
                Properties: [
                    OutOfOfficeProperty.START,
                    OutOfOfficeProperty.END,
                    OutOfOfficeProperty.SUBSTITUTE
                ]
            });
        });
        it('overlay / ObjectType: User / With OutOfOffice in future / should be null', async () => {
            const overlay = await LabelService.getInstance().getOverlayIconByProperty(KIXObjectType.USER, 'SomeTestProperty', oooUserFuture.UserID);
            expect(overlay).to.be.null
        });
    });
});