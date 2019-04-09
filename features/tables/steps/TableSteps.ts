// tslint:disable
import { expect } from 'chai';
import { Given, When, Then } from 'cucumber';
import { ITable, TableFactoryService } from '../../../src/core/browser/table';
import { KIXObjectType } from '../../../src/core/model';
import { FAQArticleTableFactory, FAQContext } from '../../../src/core/browser/faq';
import { TicketTableFactory } from '../../../src/core/browser/ticket';
import { ArticleTableFactory } from '../../../src/core/browser/ticket/table/ArticleTableFactory';
import { CustomerTableFactory } from '../../../src/core/browser/customer';
import { ContactTableFactory } from '../../../src/core/browser/contact';
import { ConfigItemTableFactory } from '../../../src/core/browser/cmdb';
import { RoleTableFactory, UserTableFactory } from '../../../src/core/browser/user';

let table: ITable;
TableFactoryService.getInstance().registerFactory(new FAQArticleTableFactory());
TableFactoryService.getInstance().registerFactory(new TicketTableFactory());
TableFactoryService.getInstance().registerFactory(new ArticleTableFactory());
TableFactoryService.getInstance().registerFactory(new CustomerTableFactory());
TableFactoryService.getInstance().registerFactory(new ContactTableFactory());
TableFactoryService.getInstance().registerFactory(new ConfigItemTableFactory());
TableFactoryService.getInstance().registerFactory(new RoleTableFactory());
TableFactoryService.getInstance().registerFactory(new UserTableFactory());

Given('Tabelle: {string}', async (objectType: KIXObjectType) => {
    table = await TableFactoryService.getInstance().createTable(`test-table-${objectType}`, objectType);
    expect(table).exist;
    await table.initialize();
});

Given('Tabelle - Schmal: {string}', async (objectType: KIXObjectType) => {
    table = await TableFactoryService.getInstance().createTable(`test-table-${objectType}`, objectType, null, null, null, false, false, true);
    expect(table).exist;
    await table.initialize();
});

Then('Selection: {int}', function (selection: Number) {
    expect(table.getTableConfiguration().enableSelection).equals(Boolean(selection));
});

Then('Toggle: {int}', async (toggle: Number) => {
    expect(table.getTableConfiguration().toggle).equals(Boolean(toggle));
});

Then('Die Spalte {string} muss sortierbar sein: {int}', async (columnId: string, sortable: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().sortable).equals(Boolean(sortable));
});

Then('Die Spalte {string} muss filterbar sein: {int}', async (columnId: string, filterable: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().filterable).equals(Boolean(filterable));
});

Then('Die Spalte {string} muss {int} breit sein', async (columnId: string, width: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().size).equals(width);
});

Then('Die Spalte {string} hat eine flexible Breite: {int}', async (columnId: string, flexible: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().resizable).equals(Boolean(flexible));
});

Then('Die Spalte {string} zeigt Text an: {int}', async (columnId: string, showText: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().showText).equals(Boolean(showText));
});

Then('Die Spalte {string} zeigt Icon an: {int}', async (columnId: string, showIcon: Number) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().showIcon).equals(Boolean(showIcon));
});

Then('Die Spalte {string} ist vom Type: {string}', async (columnId: string, type: string) => {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().dataType).equals(type);
});

Then('Die Spalte {string} zeigt Spaltenbezeichnung an: {int}', function (columnId: string, showColumnTitle: Number) {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().showColumnTitle).equals(Boolean(showColumnTitle));
});

Then('Die Spalte {string} zeigt Spaltenicon an: {int}', function (columnId: string, showColumnIcon: Number) {
    const column = table.getColumn(columnId);
    expect(column).exist;
    expect(column.getColumnConfiguration().showColumnIcon).equals(Boolean(showColumnIcon));
});
