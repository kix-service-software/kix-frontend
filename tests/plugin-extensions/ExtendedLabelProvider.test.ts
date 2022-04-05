/**
 * Copyright (C) 2006-2022 c.a.p.e. IT GmbH, https://www.cape-it.de
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

/* tslint:disable*/
import * as chai from 'chai';
const expect = chai.expect;

import { TicketLabelProvider } from '../../src/frontend-applications/agent-portal/modules/ticket/webapp/core/TicketLabelProvider';
import { ExtendedLabelProvider } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/ExtendedLabelProvider';
import { DynamicFieldValue } from '../../src/frontend-applications/agent-portal/modules/dynamic-fields/model/DynamicFieldValue';
import { LabelService } from '../../src/frontend-applications/agent-portal/modules/base-components/webapp/core/LabelService';
import { KIXObjectType } from '../../src/frontend-applications/agent-portal/model/kix/KIXObjectType';
import { TicketProperty } from '../../src/frontend-applications/agent-portal/modules/ticket/model/TicketProperty';
import { ObjectIcon } from '../../src/frontend-applications/agent-portal/modules/icon/model/ObjectIcon';
import { Ticket } from '../../src/frontend-applications/agent-portal/modules/ticket/model/Ticket';

describe('ExtendedLabelProvider', () => {

    before(() => {
        const ticketLabelProvider = new TicketLabelProvider();
        LabelService.getInstance().registerLabelProvider(ticketLabelProvider);
        ticketLabelProvider.addExtendedLabelProvider(new ExtendedTestLabelProvider())
    });

    after(() => {
        LabelService.getInstance()['objectLabelProvider'] = []
        LabelService.getInstance()['propertiesLabelProvider'].clear();
    });

    describe('Overwrite Object Icon', () => {
        it('Should return overwritten icon for object Ticket from getObjectIcon()', async () => {
            const ticket = new Ticket();
            const value = LabelService.getInstance().getObjectIcon(ticket);
            expect(value).exist;
            expect(value).equals('kix-icon-test');
        });

        it('Should return overwritten icon for ObjectType Ticket from getObjectIconForType()', async () => {
            const value = LabelService.getInstance().getObjectIconForType(KIXObjectType.TICKET);
            expect(value).exist;
            expect(value).equals('kix-icon-test');
        });

        it('Should return overwritten icon for ObjectType Ticket from getObjectTypeIcon()', async () => {
            const value = LabelService.getInstance().getObjectTypeIcon(KIXObjectType.TICKET);
            expect(value).exist;
            expect(value).equals('kix-icon-test');
        });
    });

    describe('Overwrite getPropertyText()', () => {
        it('Should return overwritten property text for TicketNumber', async () => {
            const value = await LabelService.getInstance().getPropertyText(TicketProperty.TICKET_NUMBER, KIXObjectType.TICKET);
            expect(value).exist;
            expect(value).equals('T#-Number');
        });

        it('Should return overwritten property text for QueueID', async () => {
            const value = await LabelService.getInstance().getPropertyText(TicketProperty.QUEUE_ID, KIXObjectType.TICKET);
            expect(value).exist;
            expect(value).equals('Department');
        });
    });

    describe('Overwrite getExportPropertyText()', () => {
        it('Should return overwritten export property text for TicketNumber', async () => {
            const value = await LabelService.getInstance().getExportPropertyText(TicketProperty.TICKET_NUMBER, KIXObjectType.TICKET);
            expect(value).exist;
            expect(value).equals('T#-Number');
        });

        it('Should return overwritten export property text for QueueID', async () => {
            const value = await LabelService.getInstance().getExportPropertyText(TicketProperty.QUEUE_ID, KIXObjectType.TICKET);
            expect(value).exist;
            expect(value).equals('Department');
        });
    });

    describe('Overwrite getDFDisplayValues()', () => {
        it('Should return overwritten dynamic field values', async () => {
            const fieldValue = new DynamicFieldValue();
            fieldValue.Name = 'TestDynamicField';
            const values = await LabelService.getInstance().getDFDisplayValues(KIXObjectType.TICKET, fieldValue);

            expect(values).exist;
            expect(values[0]).exist;
            expect(values[1]).exist;
            expect(values[2]).exist;

            expect(values[0]).an('array');
            expect(values[0]).length(4);
        });
    });

    describe('Overwrite getObjectText()', () => {
        it('Should return overwritten dynamic field values', async () => {
            const ticket = new Ticket();
            const value = await LabelService.getInstance().getObjectText(ticket);
            expect(value).exist;
            expect(value).equals('Testticket');
        });
    });

    describe('Overwrite getObjectName()', () => {
        it('Should return overwritten object name', async () => {
            const ticket = new Ticket();
            const value = await LabelService.getInstance().getObjectName(KIXObjectType.TICKET);
            expect(value).exist;
            expect(value).equals('Testticket');
        });
    });

    describe('Overwrite getDisplayText()', () => {
        const ticket = new Ticket();
        it('Should return overwritten display text for TicketNumber', async () => {
            const value = await LabelService.getInstance().getDisplayText(ticket, TicketProperty.TICKET_NUMBER);
            expect(value).exist;
            expect(value).equals('T#-Number');
        });

        it('Should return overwritten  display text for QueueID', async () => {
            const value = await LabelService.getInstance().getDisplayText(ticket, TicketProperty.QUEUE_ID);
            expect(value).exist;
            expect(value).equals('Department');
        });
    });

    describe('Overwrite getAdditionalText()', () => {
        const ticket = new Ticket();
        it('Should return overwritten additional text', async () => {
            const value = await LabelService.getInstance().getAdditionalText(ticket);
            expect(value).exist;
            expect(value).equals('Testticket');
        });
    });

    describe('Overwrite getPropertyValueDisplayText()', () => {
        const ticket = new Ticket();
        it('Should return overwritten property value display text for TicketNumber', async () => {
            const value = await LabelService.getInstance().getPropertyValueDisplayText(KIXObjectType.TICKET, TicketProperty.TICKET_NUMBER, '123');
            expect(value).exist;
            expect(value).equals('T#-Number');
        });

        it('Should return overwritten  property value display text for QueueID', async () => {
            const value = await LabelService.getInstance().getPropertyValueDisplayText(KIXObjectType.TICKET, TicketProperty.QUEUE_ID, 123);
            expect(value).exist;
            expect(value).equals('Department');
        });
    });

    describe('Overwrite getObjectTooltip()', () => {
        const ticket = new Ticket();
        it('Should return overwritten tooltip', async () => {
            const value = await LabelService.getInstance().getTooltip(ticket);
            expect(value).exist;
            expect(value).equals('Testticket');
        });
    });

    describe('Overwrite getPropertyIcon()', () => {
        const ticket = new Ticket();
        it('Should return overwritten property icon for TicketNumber', async () => {
            const value = await LabelService.getInstance().getPropertyIcon(TicketProperty.TICKET_NUMBER, KIXObjectType.TICKET);
            expect(value).exist;
            expect(value).equals('T#-Number');
        });

        it('Should return overwritten property icon for QueueID', async () => {
            const value = await LabelService.getInstance().getPropertyIcon(TicketProperty.QUEUE_ID, KIXObjectType.TICKET);
            expect(value).exist;
            expect(value).equals('Department');
        });
    });

    describe('Overwrite getDisplayTextClasses()', () => {
        const ticket = new Ticket();
        it('Should return overwritten text classes for TicketNumber', async () => {
            const value = await LabelService.getInstance().getDisplayTextClasses(ticket, TicketProperty.TICKET_NUMBER);
            expect(value).exist;
            expect(value).an('array');
            expect(value.length).equals(1);
            expect(value[0]).equals('T#-Number');
        });

        it('Should return overwritten text classes for QueueID', async () => {
            const value = await LabelService.getInstance().getDisplayTextClasses(ticket, TicketProperty.QUEUE_ID);
            expect(value).exist;
            expect(value).an('array');
            expect(value.length).equals(1);
            expect(value[0]).equals('Department');
        });
    });

});

class ExtendedTestLabelProvider extends ExtendedLabelProvider {

    public async getDFDisplayValues(fieldValue: DynamicFieldValue): Promise<[string[], string, string[]]> {
        const values = ['value1', 'value2', 'value3', 'value4'];
        return [values, values.join(', '), values];
    }

    public async getPropertyText(property: string, short?: boolean, translatable?: boolean): Promise<string> {
        if (property === TicketProperty.TICKET_NUMBER) {
            return 'T#-Number';
        } else if (property === TicketProperty.QUEUE_ID) {
            return 'Department';
        }

        return null;
    }

    public getObjectIcon(object?: Ticket): string | ObjectIcon {
        return 'kix-icon-test';
    }

    public getObjectTypeIcon(): string | ObjectIcon {
        return 'kix-icon-test';
    }

    public async getObjectText(object: Ticket, id?: boolean, title?: boolean, translatable?: boolean): Promise<string> {
        return 'Testticket';
    }

    public async getObjectName(plural?: boolean, translatable?: boolean): Promise<string> {
        return 'Testticket';
    }

    public async getExportPropertyText(property: string, useDisplayText?: boolean): Promise<string> {
        if (property === TicketProperty.TICKET_NUMBER) {
            return 'T#-Number';
        } else if (property === TicketProperty.QUEUE_ID) {
            return 'Department';
        }

        return null;
    }

    public async getDisplayText(object: Ticket, property: string, defaultValue?: string, translatable?: boolean, short?: boolean): Promise<string> {
        if (property === TicketProperty.TICKET_NUMBER) {
            return 'T#-Number';
        } else if (property === TicketProperty.QUEUE_ID) {
            return 'Department';
        }

        return null;
    }

    public getObjectAdditionalText(object: Ticket, translatable?: boolean): string {
        return 'Testticket';
    }

    public async getPropertyValueDisplayText(
        property: string, value: string | number, translatable?: boolean
    ): Promise<string> {
        if (property === TicketProperty.TICKET_NUMBER) {
            return 'T#-Number';
        } else if (property === TicketProperty.QUEUE_ID) {
            return 'Department';
        }

        return null;
    }

    public async getObjectTooltip(object: Ticket, translatable?: boolean): Promise<string> {
        return 'Testticket';
    }

    public async getPropertyIcon(property: string): Promise<string | ObjectIcon> {
        if (property === TicketProperty.TICKET_NUMBER) {
            return 'T#-Number';
        } else if (property === TicketProperty.QUEUE_ID) {
            return 'Department';
        }

        return null;
    }

    public getDisplayTextClasses(object: Ticket, property: string): string[] {
        if (property === TicketProperty.TICKET_NUMBER) {
            return ['T#-Number'];
        } else if (property === TicketProperty.QUEUE_ID) {
            return ['Department'];
        }

        return null;
    }
}