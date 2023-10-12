/**
 * Copyright (C) 2006-2023 KIX Service Software GmbH, https://www.kixdesk.com
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
import { KIXObjectService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/KIXObjectService';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { KIXObjectProperty } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectProperty';
import { DateTimeUtil } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/DateTimeUtil';
import { PlaceholderService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/PlaceholderService';
import { Ticket } from '../../src/frontend-applications/agent-portal/modules/ticket/model/Ticket';
import { Queue } from '../../src/frontend-applications/agent-portal/modules/ticket/model/Queue';
import { QueuePlaceholderHandler } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/QueuePlaceholderHandler';
import { TicketPlaceholderHandler } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/TicketPlaceholderHandler';
import { QueueProperty } from '../../src/frontend-applications/agent-portal/modules/ticket/model/QueueProperty';
import { TicketProperty } from '../../src/frontend-applications/agent-portal/modules/ticket/model/TicketProperty';
import { QueueLabelProvider } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/QueueLabelProvider';
import { TranslationService } from '../../src/frontend-applications/agent-portal/modules/translation/webapp/core/TranslationService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Placeholder replacement for queue', () => {

    let ticket: Ticket;
    let queue: Queue;
    let queuePlaceholderHandler: QueuePlaceholderHandler = new QueuePlaceholderHandler();
    let orgLoadFuntion
    before(() => {
        LabelService.getInstance()['objectLabelProvider'] = [];
        LabelService.getInstance()['propertiesLabelProvider'].clear();
        queue = someTestFunctions.prepareQueue();
        ticket = new Ticket();
        ticket.Title = 'ticket title';
        ticket.QueueID = queue.QueueID;

        const queueLabelProvider = new QueueLabelProvider();
        queueLabelProvider.getDisplayText = someTestFunctions.changedGetDisplayTextMethod;
        LabelService.getInstance().registerLabelProvider(queueLabelProvider);

        orgLoadFuntion = KIXObjectService.loadObjects;
        KIXObjectService.loadObjects = async (objectType, objectIds: Array<string | number>) => {
            let objects: Queue[] = [];
            if (objectIds && objectType === KIXObjectType.QUEUE) {
                if (objectIds[0] === ticket.QueueID) {
                    objects = [queue];
                }
            }
            return objects as any[];
        }

        (TranslationService.getInstance() as any).translations = {};
    });

    after(() => {
        KIXObjectService.loadObjects = orgLoadFuntion;
        LabelService.getInstance()['objectLabelProvider'] = [];
        LabelService.getInstance()['propertiesLabelProvider'].clear();
        (TranslationService.getInstance() as any).translations = null;
    });

    describe('Replace simple queue attribute placeholder.', async () => {

        it('Should replace queue ID placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.QUEUE_ID}>`, ticket);
            expect(text).equal(queue.QueueID.toString());
        });

        it('Should replace queue name placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.NAME}>`, ticket);
            expect(text).equal(queue.Name);
        });

        it('Should replace queue fullname placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.FULLNAME}>`, ticket);
            expect(text).equal(queue.Fullname);
        });

        it('Should replace queue comment placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.COMMENT}>`, ticket);
            expect(text).equal(queue.Comment);
        });

        it('Should replace queue parend id placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.PARENT_ID}>`, ticket);
            expect(text).equal(queue.ParentID.toString());
        });

        it('Should replace queue parent placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.PARENT}>`, ticket);
            expect(text).equal(`${QueueProperty.PARENT}_Name`);
        });

        it('Should replace queue system address id placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.SYSTEM_ADDRESS_ID}>`, ticket);
            expect(text).equal(queue.SystemAddressID.toString());
        });

        it('Should replace queue system address placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.SYSTEM_ADDRESS}>`, ticket);
            expect(text).equal(`${QueueProperty.SYSTEM_ADDRESS}_Name`);
        });

        it('Should replace queue follwo up id placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.FOLLOW_UP_ID}>`, ticket);
            expect(text).equal(queue.FollowUpID.toString());
        });

        it('Should replace queue follow up placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.FOLLOW_UP}>`, ticket);
            expect(text).equal(`${QueueProperty.FOLLOW_UP}_Name`);
        });

        it('Should replace queue follwo up lock placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.FOLLOW_UP_LOCK}>`, ticket);
            expect(text).equal(queue.FollowUpLock.toString());
        });

        it('Should replace queue create by placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${KIXObjectProperty.CREATE_BY}>`, ticket);
            expect(text).equal(`${KIXObjectProperty.CREATE_BY}_Name`);
        });

        it('Should replace queue change by placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${KIXObjectProperty.CHANGE_BY}>`, ticket);
            expect(text).equal(`${KIXObjectProperty.CHANGE_BY}_Name`);
        });

        it('Should replace queue valid id placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${KIXObjectProperty.VALID_ID}>`, ticket);
            expect(text).equal(queue.ValidID.toString());
        });

        it('Should replace queue valid placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.VALID}>`, ticket);
            expect(text).equal(`${QueueProperty.VALID}_Name`);
        });
    });

    describe('Replace complex queue attribute placeholder (translatable).', async () => {

        it('Should replace queue create time placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${KIXObjectProperty.CREATE_TIME}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(queue.CreateTime, 'en');
            expect(text).equal(date);

            const germanText = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${KIXObjectProperty.CREATE_TIME}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(queue.CreateTime, 'de');
            expect(germanText).equal(germanDate);
        });

        it('Should replace queue change time placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${KIXObjectProperty.CHANGE_TIME}>`, ticket);
            const date = await DateTimeUtil.getLocalDateTimeString(queue.ChangeTime, 'en');
            expect(text).equal(date);

            const germanText = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${KIXObjectProperty.CHANGE_TIME}>`, ticket, 'de');
            const germanDate = await DateTimeUtil.getLocalDateTimeString(queue.ChangeTime, 'de');
            expect(germanText).equal(germanDate);
        });
    });

    describe('Replace complex queue attribute signature placeholder.', async () => {

        let ticketPlaceholderHandler: TicketPlaceholderHandler = new TicketPlaceholderHandler();
        before(() => {
            PlaceholderService.getInstance().registerPlaceholderHandler(ticketPlaceholderHandler);
        });

        after(() => {
            PlaceholderService.getInstance().unregisterPlaceholderHandler(ticketPlaceholderHandler.handlerId);
        });

        it('Should replace simple queue signature placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.SIGNATURE}>`, ticket);
            expect(text).equal(queue.Signature);
        });

        it('Should replace complex queue signature placeholder (further placeholders within signature) ', async () => {
            queue.Signature = `signature with ticket title "<KIX_TICKET_${TicketProperty.TITLE}>" and queue name "<KIX_QUEUE_${QueueProperty.NAME}>" placeholder.`;
            const expetedText = `signature with ticket title "${ticket.Title}" and queue name "${queue.Name}" placeholder.`;
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.SIGNATURE}>`, ticket);
            expect(text).equal(expetedText);
        });

        it('Should replace complex queue signature placeholder (signature placeholders in signature should be replaced with empty string) ', async () => {
            queue.Signature = `signature with queue name "<KIX_QUEUE_${QueueProperty.NAME}>" and 2 signature <KIX_QUEUE_${QueueProperty.SIGNATURE}> + (&lt;KIX_QUEUE_${QueueProperty.SIGNATURE}&gt;) placeholders.`;
            const expetedText = `signature with queue name "${queue.Name}" and 2 signature  + () placeholders.`;
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.SIGNATURE}>`, ticket);
            expect(text).equal(expetedText);
        });
    });

    describe('Replace queue attribute sub queues placeholder with empty string.', async () => {

        it('Should replace queue sub queues placeholder with empty string', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.SUB_QUEUES}>`, ticket);
            expect(text).equal('');
        });
    });

    describe('Replace dynamic field queue attribute placeholder.', async () => {

    });

    describe('Replace unknown or emtpy queue attribute placeholder with empty string.', async () => {

        it('Should replace unknown queue attribute placeholder', async () => {
            const text = await queuePlaceholderHandler.replace(`<KIX_QUEUE_UnknownAttribute>`, ticket);
            expect(text).exist;
            expect(text).equal('');
        });

        it('Should replace empty queue attribute placeholder', async () => {
            const empty_1 = await queuePlaceholderHandler.replace(`<KIX_QUEUE_>`, ticket);
            expect(empty_1).exist;
            expect(empty_1).equal('');

            const empty_2 = await queuePlaceholderHandler.replace(`<KIX_QUEUE>`, ticket);
            expect(empty_2).exist;
            expect(empty_2).equal('');
        });
    });

    describe('Replace with queue placeholder from queue.', async () => {

        it('Should replace queue attribute placeholder from ticket queue', async () => {
            let ticketPlaceholderHandler: TicketPlaceholderHandler = new TicketPlaceholderHandler();
            const name = await ticketPlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.NAME}>`, ticket);
            expect(name).exist;
            expect(name, 'should be name of ticket queue').equal(queue.Name);
            const number = await ticketPlaceholderHandler.replace(`<KIX_QUEUE_${QueueProperty.FULLNAME}>`, ticket);
            expect(number).exist;
            expect(number, 'should be fullname of ticket queue').equal(queue.Fullname);
        });
    });
});

class someTestFunctions {
    public static async changedGetDisplayTextMethod(queue: Queue, property: string): Promise<string> {
        let displayValue = queue[property];
        switch (property) {
            case KIXObjectProperty.CHANGE_BY:
            case KIXObjectProperty.CREATE_BY:
            case QueueProperty.VALID:
            case QueueProperty.PARENT:
            case QueueProperty.FOLLOW_UP:
            case QueueProperty.SYSTEM_ADDRESS:
                displayValue = `${property}_Name`;
                break;
            default:
        }
        return typeof displayValue !== 'undefined' && displayValue !== null ? displayValue.toString() : null;
    }

    public static prepareQueue(): Queue {
        const queue = new Queue();

        queue.QueueID = 2;
        queue.Name = 'some queue';
        queue.Fullname = 'parent::some queue';
        queue.SystemAddressID = 21;
        queue.FollowUpID = 22;
        queue.FollowUpLock = 1;
        queue.UnlockTimeout = 123456;
        queue.ParentID = 3;
        queue.SubQueues = [new Queue()];
        queue.ValidID = 1;
        queue.Comment = 'some comment';
        queue.CreateTime = '2019-05-30 08:45:30';
        queue.CreateBy = 1;
        queue.ChangeTime = '2019-06-05 10:45:30';
        queue.ChangeBy = 2;
        queue.Signature = 'simple signature';

        return queue;

    }
}
