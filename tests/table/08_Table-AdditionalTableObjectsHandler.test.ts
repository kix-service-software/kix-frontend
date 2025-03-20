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
import { Table } from '../../src/frontend-applications/agent-portal/modules/table/model/Table';
import { RowObject } from '../../src/frontend-applications/agent-portal/modules/table/model/RowObject';
import { Row } from '../../src/frontend-applications/agent-portal/modules/table/model/Row';
import { TableContentProvider } from '../../src/frontend-applications/agent-portal/modules/table/webapp/core/TableContentProvider';
import { IAdditionalTableObjectsHandler } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/IAdditionalTableObjectsHandler';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { AdditionalTableObjectsHandlerConfiguration } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/AdditionalTableObjectsHandlerConfiguration';
import { KIXObjectLoadingOptions } from '../../src/frontend-applications/agent-portal/model/KIXObjectLoadingOptions';
import { KIXObject } from '../../src/frontend-applications/agent-portal/model/kix/KIXObject';
import { ServiceRegistry } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/ServiceRegistry';
import { TableConfiguration } from '../../src/frontend-applications/agent-portal/model/configuration/TableConfiguration';
import { ConfigurationType } from '../../src/frontend-applications/agent-portal/model/configuration/ConfigurationType';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Table Object Handler Tests', () => {

    describe('Get registered handler by handlerId.', () => {
        let handler: TestHandler;

        before(() => {
            handler = new TestHandler();
            ServiceRegistry.registerAdditionalTableObjectsHandler(handler);
        })

        it('Should return registered handler.', () => {
            const returnHandler = ServiceRegistry.getAdditionalTableObjectsHandler(handler.handlerId);
            expect(returnHandler).exist;
            expect(returnHandler.handlerId).equal(handler.handlerId);
        });

        after(() => {
            ServiceRegistry['additionalTableObjectsHandler'] = new Map()
        });
    });

    describe('Check intersection and union handling', () => {
        let handler_1: TestHandler;
        let handlerConfig_1: AdditionalTableObjectsHandlerConfiguration;
        let objects_1: TestObject[] = [];
        let handler_2: TestHandler;
        let handlerConfig_2: AdditionalTableObjectsHandlerConfiguration;
        let objects_2: TestObject[] = [];
        let table_objects: TestObject[] = [];
        let table: Table;

        before(async () => {
            table_objects = someTestFunctions.getObjects([1, 2, 3, 4, 5, 6]);

            // 1st and 2nd are in table_objects, 3rd and 4th are new
            objects_1 = someTestFunctions.getObjects([2, 3, 7, 8]);
            handler_1 = new TestHandler();
            ServiceRegistry.registerAdditionalTableObjectsHandler(handler_1);
            handlerConfig_1 = new AdditionalTableObjectsHandlerConfiguration(
                'handler_1', 'handler 1', handler_1.handlerId,
                {
                    objects: objects_1
                }
            );

            // 1st is in table_objects and in objects_1, last (5th) is new
            objects_2 = someTestFunctions.getObjects([2, 4, 5, 8, 9]);
            handler_2 = new TestHandler();
            ServiceRegistry.registerAdditionalTableObjectsHandler(handler_2);
            handlerConfig_2 = new AdditionalTableObjectsHandlerConfiguration(
                'handler_2', 'handler 2', handler_2.handlerId,
                {
                    objects: objects_2
                }
            );
        });

        describe('Check intersection with one handler', () => {

            before(async () => {
                table = new Table('Test_Table',
                    someTestFunctions.getTablConfig([handlerConfig_1])
                );
                table.setContentProvider(new TestContentProvider('TEST_OBJECT', table, null, null, null, table_objects))
                await table.initialize();
            });

            it('Should return right objects on intersect.', async () => {
                const rows: Row[] = table.getRows(true);
                expect(rows).exist;
                expect(rows).an('array');


                const isList = rows.map((r) => (r.getRowObject().getObject() as TestObject).ID).join(', ');
                expect(rows.length).equal(2, `length does not match (list: ${isList})`);

                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === objects_1[0].ID), `${objects_1[0].ID} is missing (is: ${isList})`).is.true;
                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === objects_1[1].ID), `${objects_1[1].ID} is missing (is: ${isList})`).is.true;
            });
        });

        describe('Check union with one handler', () => {

            before(async () => {
                table = new Table('Test_Table',
                    someTestFunctions.getTablConfig([handlerConfig_1], false) // set intersetion false
                );
                table.setContentProvider(new TestContentProvider('TEST_OBJECT', table, null, null, null, table_objects))
                await table.initialize();
            });

            it('Should return right objects on union.', async () => {
                const rows: Row[] = table.getRows(true);
                expect(rows).exist;
                expect(rows).an('array');

                const isList = rows.map((r) => (r.getRowObject().getObject() as TestObject).ID).join(', ');
                expect(rows.length).equal(8, `length does not match (list: ${isList})`);

                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === objects_1[0].ID), `${objects_1[0].ID} is missing (is: ${isList})`).is.true;
                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === objects_1[1].ID), `${objects_1[1].ID} is missing (is: ${isList})`).is.true;
                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === objects_1[3].ID), `${objects_1[3].ID} is missing (is: ${isList})`).is.true;

                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === table_objects[3].ID), `${table_objects[3].ID} is missing (is: ${isList})`).is.true;
            });
        });

        describe('Check intersection with two handlers (same handler but registered with differnt config in table config)', () => {

            before(async () => {
                table = new Table('Test_Table',
                    someTestFunctions.getTablConfig([handlerConfig_1, handlerConfig_2])
                );
                table.setContentProvider(new TestContentProvider('TEST_OBJECT', table, null, null, null, table_objects))
                await table.initialize();
            });

            it('Should return right objects on intersect.', async () => {
                const rows: Row[] = table.getRows(true);
                expect(rows).exist;
                expect(rows).an('array');

                const isList = rows.map((r) => (r.getRowObject().getObject() as TestObject).ID).join(', ');
                expect(rows.length).equal(1, `length does not match (list: ${isList})`);

                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === objects_1[0].ID), `${objects_1[0].ID} is missing (is: ${isList})`).is.true;
            });
        });

        describe('Check union with two handlers (same handler but registered with differnt config in table config)', () => {

            before(async () => {
                table = new Table('Test_Table',
                    someTestFunctions.getTablConfig([handlerConfig_1, handlerConfig_2], false) // set intersetion false
                );
                table.setContentProvider(new TestContentProvider('TEST_OBJECT', table, null, null, null, table_objects))
                await table.initialize();
            });

            it('Should return right objects on union.', async () => {
                const rows: Row[] = table.getRows(true);
                expect(rows).exist;
                expect(rows).an('array');

                const isList = rows.map((r) => (r.getRowObject().getObject() as TestObject).ID).join(', ');
                expect(rows.length).equal(9, `length does not match (list: ${isList})`);

                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === objects_1[0].ID), `${objects_1[0].ID} is missing (is: ${isList})`).is.true;
                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === objects_1[1].ID), `${objects_1[1].ID} is missing (is: ${isList})`).is.true;
                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === objects_1[3].ID), `${objects_1[3].ID} is missing (is: ${isList})`).is.true;

                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === objects_2[4].ID), `${objects_2[4].ID} is missing (is: ${isList})`).is.true;

                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === table_objects[3].ID), `${table_objects[3].ID} is missing (is: ${isList})`).is.true;
            });
        });

        describe('Check intersection with two handlers after reload with relevant handlerConfigIds', () => {

            before(async () => {
                table = new Table('Test_Table',
                    someTestFunctions.getTablConfig([handlerConfig_1, handlerConfig_2])
                );
                table.setContentProvider(new TestContentProvider('TEST_OBJECT', table, null, null, null, table_objects))
                await table.initialize();

                // change objects from 2,3,7,8 to 11,12,13 - but it should have no effect on reload (see below)
                handlerConfig_1.handlerConfiguration.objects = someTestFunctions.getObjects([11, 12, 13]);

                // change objects from 2,4,5,8,9 to 3,4,5
                handlerConfig_2.handlerConfiguration.objects = someTestFunctions.getObjects([3, 4, 5]);

                // relaod, but only refresh second handler (intersect result should now be "3")
                await table.reload(null, null, [handlerConfig_2.id]);
            });

            it('Should return right objects on intersect.', async () => {
                const rows: Row[] = table.getRows(true);
                expect(rows).exist;
                expect(rows).an('array');

                const isList = rows.map((r) => (r.getRowObject().getObject() as TestObject).ID).join(', ');
                expect(rows.length).equal(1, `length does not match (list: ${isList})`);

                expect(rows.some((r) => (r.getRowObject().getObject() as TestObject).ID === table_objects[2].ID), `${table_objects[2].ID} is missing (is: ${isList})`).is.true;
            });
        });

        after(() => {
            ServiceRegistry['additionalTableObjectsHandler'] = new Map()
        });
    });

});

class someTestFunctions {

    public static getObjects(ids: number[]): TestObject[] {
        return ids.map((id) => new TestObject(
            {
                ID: `TestObject-${id}`
            } as TestObject
        ));
    }

    public static getTablConfig(handlerConfigs: AdditionalTableObjectsHandlerConfiguration[], intersection: boolean = true): TableConfiguration {
        return new TableConfiguration(
            'test-table-config', 'Test Table', ConfigurationType.Table,
            'TEST_OBJECT',
            null, 10,
            null, null, false, false, null, null, null, null,
            null, null, null,
            handlerConfigs,
            intersection
        );
    }
}

export class TestContentProvider extends TableContentProvider<TestObject> {

    public async loadData(): Promise<Array<RowObject<TestObject>>> {
        return this.getRowObjects(
            this.objects as TestObject[]
        );
    }

    public async getRowObjects(objects: TestObject[]): Promise<RowObject[]> {
        return objects.map((o) => new RowObject([], o));
    }
}

export class TestObject extends KIXObject {

    public ObjectId: string | number;

    public KIXObjectType: KIXObjectType | string = 'TEST_OBJECT';

    public ID: string;

    public constructor(testObject: TestObject) {
        super(testObject);
        if (testObject) {
            this.ID = testObject.ID;
            this.ObjectId = testObject.ID;
        }
    }
}

export class TestHandler implements IAdditionalTableObjectsHandler {

    public handlerId: string = 'TestHandler';

    public objectType: any = 'TEST_OBJECT';

    public async determineObjects(
        handlerConfig: AdditionalTableObjectsHandlerConfiguration, loadingOptions?: KIXObjectLoadingOptions
    ): Promise<TestObject[]> {
        return handlerConfig.handlerConfiguration.objects;
    }

}