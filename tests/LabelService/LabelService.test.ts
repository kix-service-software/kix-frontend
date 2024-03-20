/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable */

import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { LabelService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { UserProperty } from '../../src/frontend-applications/agent-portal/modules/user/model/UserProperty';
import { User } from '../../src/frontend-applications/agent-portal/modules/user/model/User';
import { UserPreference } from '../../src/frontend-applications/agent-portal/modules/user/model/UserPreference';
import { DateTimeUtil } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/DateTimeUtil';
import { UserLabelProvider } from '../../src/frontend-applications/agent-portal/modules/user/webapp/core/UserLabelProvider';
import { OutOfOfficeProperty } from '../../src/frontend-applications/agent-portal/modules/user/model/OutOfOfficeProperty';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('LabelService', () => {

    describe('getOverlayIcon', () => {
        before('Should register handler', () => {
            LabelService.getInstance().registerLabelProvider(new UserLabelProvider());
        });
        it('overlay / ObjectType: none / should be null', async () => {
            const user = new User();
            const overlay = await LabelService.getInstance().getOverlayIcon(user, UserProperty.USER_ID, 1);
            expect(overlay).to.be.null
        });
        it('overlay / ObjectType: User / Without Preference / should be null', async () => {
            const user = new User();
            user.KIXObjectType = KIXObjectType.USER;
            user.IsAgent = 1;
            user.UserID = 1;

            const overlay = await LabelService.getInstance().getOverlayIcon(user, UserProperty.USER_ID, 1);
            expect(overlay).to.be.null
        });
        it('overlay / ObjectType: User / With OutOfOffice Preferences / should be an overlay object', async () => {
            let start = new Date();
            start.setDate(start.getDate() - 4);

            const end = new Date();
            end.setDate(end.getDate() + 2);

            const outOfOfficeStart = new UserPreference();
            outOfOfficeStart.ID = 'OutOfOfficeStart';
            outOfOfficeStart.ObjectId = 'OutOfOfficeStart';
            outOfOfficeStart.Value = DateTimeUtil.getKIXDateString(start);


            const outOfOfficeEnd = new UserPreference();
            outOfOfficeEnd.ID = 'OutOfOfficeEnd';
            outOfOfficeEnd.ObjectId = 'OutOfOfficeEnd';
            outOfOfficeEnd.Value = DateTimeUtil.getKIXDateString(end);

            const user = new User();
            user.KIXObjectType = KIXObjectType.USER;
            user.IsAgent = 1;
            user.UserID = 1;
            user.Preferences = [
                outOfOfficeStart,
                outOfOfficeEnd
            ];

            const overlay = await LabelService.getInstance().getOverlayIcon(user, UserProperty.USER_ID);
            expect(overlay).to.be.deep.property('Data', {
                KIXObjectType: KIXObjectType.USER_PREFERENCE,
                Start: outOfOfficeStart.Value,
                End: outOfOfficeEnd.Value,
                Properties: [OutOfOfficeProperty.START, OutOfOfficeProperty.END]
            });
        });
        it('overlay / ObjectType: User / With OutOfOffice Preferences in future / should be null', async () => {
            let start = new Date();
            start.setDate(start.getDate() + 7);

            const end = new Date();
            end.setDate(end.getDate() + 14);

            const outOfOfficeStart = new UserPreference();
            outOfOfficeStart.ID = 'OutOfOfficeStart';
            outOfOfficeStart.ObjectId = 'OutOfOfficeStart';
            outOfOfficeStart.Value = DateTimeUtil.getKIXDateString(start);


            const outOfOfficeEnd = new UserPreference();
            outOfOfficeEnd.ID = 'OutOfOfficeEnd';
            outOfOfficeEnd.ObjectId = 'OutOfOfficeEnd';
            outOfOfficeEnd.Value = DateTimeUtil.getKIXDateString(end);

            const user = new User();
            user.KIXObjectType = KIXObjectType.USER;
            user.IsAgent = 1;
            user.UserID = 1;
            user.Preferences = [
                outOfOfficeStart,
                outOfOfficeEnd
            ];

            const overlay = await LabelService.getInstance().getOverlayIcon(user, UserProperty.USER_ID);
            expect(overlay).to.be.null
        });
    });
    describe('getOverlayIconForType', () => {
        before('Should register handler', () => {
            LabelService.getInstance().registerLabelProvider(new UserLabelProvider());
        });
        it('overlay / ObjectType: none / should be null', async () => {
            const user = new User();
            const overlay = await LabelService.getInstance().getOverlayIconForType(user.KIXObjectType, user.UserID);
            expect(overlay).to.be.null
        });
        it('overlay / ObjectType: User / Without Preference / should be null', async () => {
            const user = new User();
            user.KIXObjectType = KIXObjectType.USER;
            user.IsAgent = 1;
            user.UserID = 1;

            const overlay = await LabelService.getInstance().getOverlayIconForType(user.KIXObjectType, user.UserID);
            expect(overlay).to.be.null
        });
        it('overlay / ObjectType: User / With OutOfOffice Preferences / should be an overlay object', async () => {
            let start = new Date();
            start.setDate(start.getDate() - 4);

            const end = new Date();
            end.setDate(end.getDate() + 2);

            const outOfOfficeStart = new UserPreference();
            outOfOfficeStart.ID = 'OutOfOfficeStart';
            outOfOfficeStart.ObjectId = 'OutOfOfficeStart';
            outOfOfficeStart.Value = DateTimeUtil.getKIXDateString(start);


            const outOfOfficeEnd = new UserPreference();
            outOfOfficeEnd.ID = 'OutOfOfficeEnd';
            outOfOfficeEnd.ObjectId = 'OutOfOfficeEnd';
            outOfOfficeEnd.Value = DateTimeUtil.getKIXDateString(end);

            const user = new User();
            user.KIXObjectType = KIXObjectType.USER;
            user.IsAgent = 1;
            user.UserID = 1;
            user.Preferences = [
                outOfOfficeStart,
                outOfOfficeEnd
            ];

            const overlay = await LabelService.getInstance().getOverlayIconForType(user.KIXObjectType, undefined, undefined, user);
            expect(overlay).to.be.deep.property('Data', {
                KIXObjectType: KIXObjectType.USER_PREFERENCE,
                Start: outOfOfficeStart.Value,
                End: outOfOfficeEnd.Value,
                Properties: [OutOfOfficeProperty.START, OutOfOfficeProperty.END]
            });
        });
        it('overlay / ObjectType: User / With OutOfOffice Preferences in future / should be null', async () => {
            let start = new Date();
            start.setDate(start.getDate() + 7);

            const end = new Date();
            end.setDate(end.getDate() + 14);

            const outOfOfficeStart = new UserPreference();
            outOfOfficeStart.ID = 'OutOfOfficeStart';
            outOfOfficeStart.ObjectId = 'OutOfOfficeStart';
            outOfOfficeStart.Value = DateTimeUtil.getKIXDateString(start);


            const outOfOfficeEnd = new UserPreference();
            outOfOfficeEnd.ID = 'OutOfOfficeEnd';
            outOfOfficeEnd.ObjectId = 'OutOfOfficeEnd';
            outOfOfficeEnd.Value = DateTimeUtil.getKIXDateString(end);

            const user = new User();
            user.KIXObjectType = KIXObjectType.USER;
            user.IsAgent = 1;
            user.UserID = 1;
            user.Preferences = [
                outOfOfficeStart,
                outOfOfficeEnd
            ];

            const overlay = await LabelService.getInstance().getOverlayIconForType(user.KIXObjectType, undefined, undefined, user);
            expect(overlay).to.be.null
        });
    });
});