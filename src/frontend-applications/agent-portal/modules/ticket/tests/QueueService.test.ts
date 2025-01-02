/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

// tslint:disable
import chai = require('chai');
import chaiAsPromised = require('chai-as-promised');
import { Queue } from '../model/Queue';
import { QueueService } from '../webapp/core/admin/QueueService';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('QueueService', () => {

    describe('Get Queues Hierarchy', async () => {
        const queue_1_1 = new Queue();
        queue_1_1.QueueID = Number(2);
        queue_1_1.Name = "Sub1";
        queue_1_1.Fullname = "Top1::Sub1";
        queue_1_1.ParentID = Number(1);
        const queue_2_1_1 = new Queue();
        queue_2_1_1.QueueID = Number(5);
        queue_2_1_1.Name = "Sub1.1";
        queue_2_1_1.Fullname = "Top2::Sub1::Sub1.1";
        queue_2_1_1.ParentID = Number(4);

        const queues: Queue[] = [];
        queues.push(queue_1_1, queue_2_1_1);

        const queuesHierarchy = await QueueService.getInstance().getQueuesHierarchy(false, queues, undefined);

        it('should contain expected Top1', () => {
            const checkQueue = queuesHierarchy.filter((q) => q.Fullname === 'Top1');
            expect(checkQueue[0]).exist;
            expect(checkQueue[0].QueueID).exist;
            expect(checkQueue[0].Name).equals('Top1');
            expect(checkQueue[0].Fullname).equals('Top1');
            expect(checkQueue[0].ValidID).equals(Number(2));
            expect(checkQueue[0].SubQueues.length).equals(Number(1));
        });

        it('should contain expected Top1::Sub1 as SubQueue of Top1', () => {
            const checkQueue = queuesHierarchy.filter((q) => q.Fullname === 'Top1');
            const checkSubQueue = checkQueue[0].SubQueues.filter((q) => q.Fullname === 'Top1::Sub1');
            expect(checkSubQueue[0]).exist;
            expect(checkSubQueue[0].QueueID).equals(Number(2));
            expect(checkSubQueue[0].Name).equals('Sub1');
            expect(checkSubQueue[0].Fullname).equals('Top1::Sub1');
            expect(checkSubQueue[0].ParentID).equals(checkQueue[0].QueueID);
            expect(checkSubQueue[0].ValidID).equals(Number(1));
            expect(checkSubQueue[0].SubQueues.length).equals(Number(0));
        });

        it('should contain expected Top2', () => {
            const checkQueue = queuesHierarchy.filter((q) => q.Fullname === 'Top2');
            expect(checkQueue[0]).exist;
            expect(checkQueue[0].QueueID).exist;
            expect(checkQueue[0].Name).equals('Top2');
            expect(checkQueue[0].Fullname).equals('Top2');
            expect(checkQueue[0].ValidID).equals(Number(2));
        });

        it('should contain expected Top2::Sub1 as SubQueue of Top2', () => {
            const checkQueue = queuesHierarchy.filter((q) => q.Fullname === 'Top2');
            const checkSubQueue = checkQueue[0].SubQueues.filter((q) => q.Fullname === 'Top2::Sub1');
            expect(checkSubQueue[0]).exist;
            expect(checkSubQueue[0].QueueID).exist;
            expect(checkSubQueue[0].Name).equals('Sub1');
            expect(checkSubQueue[0].Fullname).equals('Top2::Sub1');
            expect(checkSubQueue[0].ParentID).equals(checkQueue[0].QueueID);
            expect(checkSubQueue[0].ValidID).equals(Number(2));
            expect(checkSubQueue[0].SubQueues.length).equals(Number(1));
        });

        it('should contain expected Top2::Sub1::Sub1.1 as SubQueue of Top2::Sub1 as SubQueue of Top2', () => {
            const checkQueue = queuesHierarchy.filter((q) => q.Fullname === 'Top2');
            const checkSubQueue = checkQueue[0].SubQueues.filter((q) => q.Fullname === 'Top2::Sub1');
            const checkSubSubQueue = checkSubQueue[0].SubQueues.filter((q) => q.Fullname === 'Top2::Sub1::Sub1.1');
            expect(checkSubSubQueue[0]).exist;
            expect(checkSubSubQueue[0].QueueID).equals(Number(5));
            expect(checkSubSubQueue[0].Name).equals('Sub1.1');
            expect(checkSubSubQueue[0].Fullname).equals('Top2::Sub1::Sub1.1');
            expect(checkSubSubQueue[0].ParentID).equals(checkSubQueue[0].QueueID);
            expect(checkSubSubQueue[0].ValidID).equals(Number(1));
            expect(checkSubSubQueue[0].SubQueues.length).equals(Number(0));
        });
    });

});