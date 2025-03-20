/**
 * Copyright (C) 2006-2024 KIX Service Software GmbH, https://www.kixdesk.com
 * --
 * This software comes with ABSOLUTELY NO WARRANTY. For details, see
 * the enclosed file LICENSE for license information (GPL3). If you
 * did not receive this file, see https://www.gnu.org/licenses/gpl-3.0.txt.
 * --
 */

export class MockData {

    public static TicketListDefaultReportMock = {
        'Comment': 'Provides overview of number of tickets created in given month by type and organization.',
        'Config': {
            'DataSource': {
                'OutputHandler': [
                    {
                        'AddColumnTotal': 1,
                        'AddRowTotal': 1,
                        'ColumnAttribute': 'type_name',
                        'Columns': 'SELECT name FROM ticket_type WHERE id IN (${Parameters.TypeIDList})',
                        'CountAttribute': 'total',
                        'Name': 'Pivot'
                    }
                ],
                'SQL': {
                    'any': 'base64(U0VMRUNUIG8ubmFtZSBBUyBvcmdhbmlzYXRpb24sIHR0Lm5hbWUgQVMgdHlwZV9uYW1lLCBjb3VudCgqKSBBUyB0b3RhbCAKICBGUk9NIG9yZ2FuaXNhdGlvbiBvLCB0aWNrZXRfdHlwZSB0dCwgdGlja2V0IHQgCiBXSEVSRSB0LnR5cGVfaWQgPSB0dC5pZAogICBBTkQgdC5vcmdhbmlzYXRpb25faWQgPSBvLmlkCiAgIEFORCB0dC5pZCBJTiAoJHtQYXJhbWV0ZXJzLlR5cGVJRExpc3R9KQogICBBTkQgby5pZCBJTiAoJHtQYXJhbWV0ZXJzLk9yZ2FuaXNhdGlvbklETGlzdH0pCiAgIEFORCB0LmNyZWF0ZV90aW1lIEJFVFdFRU4gJyR7UGFyYW1ldGVycy5Gcm9tRGF0ZX0nIEFORCAnJHtQYXJhbWV0ZXJzLlRvRGF0ZX0nCiBHUk9VUCBCWSBvLm5hbWUsIHR0Lm5hbWUKIE9SREVSIEJZIG8ubmFtZSwgdHQubmFtZQo=)'
                }
            },
            'Parameters': [
                {
                    'DataType': 'DATE',
                    'Label': 'From',
                    'Name': 'FromDate',
                    'Required': 1
                },
                {
                    'DataType': 'DATE',
                    'Label': 'To',
                    'Name': 'ToDate',
                    'Required': 1
                },
                {
                    'DataType': 'NUMERIC',
                    'Label': 'Ticket Type',
                    'Multiple': 1,
                    'Name': 'TypeIDList',
                    'References': 'TicketType.ID',
                    'Required': 1
                },
                {
                    'DataType': 'NUMERIC',
                    'Label': 'Organisation',
                    'Multiple': 1,
                    'Name': 'OrganisationIDList',
                    'References': 'Organisation.ID',
                    'Required': 1
                }
            ],
            'OutputFormats': {
                'CSV': {
                    'IncludeColumnHeader': 1,
                    'Quote': '\"',
                    'Separator': ','
                },
                'JSON': {
                    'Title': 'JSON Title'
                }
            }
        },
        'DataSource': 'GenericSQL',
        'ID': 1,
        'Name': 'Number Of Tickets Created Per Type and Organization',
        'ValidID': 1
    };

    public static ReportDefinitionMock = {
        'ID': 5,
        'Name': 'ReportMock',
        'Comment': 'ReportMock Comment',
        'ValidID': 1,
        'DataSource': 'GenericSQL',
        'Config': {
            'DataSource': {
                'SQL': {
                    'any': 'base64(U2VsZWN0ICogZnJvbSB0aWNrZXQ7)'
                }
            },
            'OutputFormats': {
                'CSV': {
                    'IncludeColumnHeader': 1,
                    'Quote': '\"',
                    'Separator': ','
                },
                'JSON': {
                    'Title': 'JSON Title'
                }
            },
            'Parameters': [
                {
                    'DataType': 'STRING',
                    'Default': [
                        'b',
                        'c'
                    ],
                    'Description': 'MockParameter',
                    'Label': 'MockParameter',
                    'Multiple': 1,
                    'Name': 'MockParameter',
                    'PossibleValues': [
                        'a',
                        'b',
                        'c',
                        'd'
                    ],
                    'ReadOnly': 1,
                    'References': null,
                    'Required': 1
                },
                {
                    'DataType': 'NUMERIC',
                    'Default': 12,
                    'Description': 'MockReferenceParameter',
                    'Label': 'MockReferenceParameter',
                    'Multiple': 0,
                    'Name': 'MockReferenceParameter',
                    'PossibleValues': [
                        13,
                        12,
                        10
                    ],
                    'ReadOnly': 0,
                    'References': 'Queue.QueueID',
                    'Required': 1
                }
            ],
            'Title': 'MockReport'
        }
    };

    public static OutputFormatsMock = [
        {
            'Description': 'Converts the report data to CSV.',
            'DisplayName': 'CSV',
            'Name': 'CSV',
            'Options': {
                'Columns': {
                    'Description': 'A list (Array) of the columns to be contained in the order in which they should occur in the output result.',
                    'Label': 'Columns',
                    'Name': 'Columns',
                    'Required': 1
                },
                'IncludeColumnHeader': {
                    'Description': 'Determine if a header containing the column names should be contained. Default: 0 (true).',
                    'Label': 'Include Column Headers',
                    'Name': 'IncludeColumnHeader',
                    'Required': 0
                },
                'Quote': {
                    'Description': 'The quote character to be used. Default: \' (Double Quote).',
                    'Label': 'Quote',
                    'Name': 'Quote',
                    'Required': 0
                },
                'Separator': {
                    'Description': 'The value separator to be used. Default: , (Comma).',
                    'Label': 'Separator',
                    'Name': 'Separator',
                    'Required': 0
                },
                'Title': {
                    'Description': 'A simple title, contained in the first row/cell of the output result.',
                    'Label': 'Title',
                    'Name': 'Title',
                    'Required': 0
                }
            }
        },
        {
            'Description': 'Converts the report data to JSON.',
            'DisplayName': 'JSON',
            'Name': 'JSON',
            'Options': {
                'Title': {
                    'Description': 'A simple title contained in the output result.',
                    'Label': 'Title',
                    'Name': 'Title',
                    'Required': 0
                }
            }
        }
    ];

    public static GenericSQLMock = {
        'Description': 'Allows to retrieve report data based on an SQL statement.',
        'DisplayName': 'Generic SQL',
        'Name': 'GenericSQL',
        'Options': {
            'PostMethods': {
                'Description': 'A list of methods to be run on the data in the given order. Each output of a method will be used as the input of the following.',
                'Label': 'Post Methods',
                'Name': 'PostMethods',
                'Required': 0
            },
            'SQL': {
                'Description': 'The SQL statement. You can also base64-encode the statement in the form \'base64(...)\'.',
                'Label': 'SQL',
                'Name': 'SQL',
                'Required': 1
            }
        },
        'OutputHandlers': {
            'Pivot': {
                'Description': 'Converts the report data to a pivot table.',
                'Name': 'Pivot',
                'Options': {
                    'AddColumnTotal': {
                        'Description': 'Add a \'Total\' row will be appended. Default: 0 (false)',
                        'Label': 'Add Column Total',
                        'Name': 'AddColumnTotal',
                        'Required': 0
                    },
                    'AddRowTotal': {
                        'Description': 'Add a column \'Total\' for each row. Default: 0 (false)',
                        'Label': 'Add Row Total',
                        'Name': 'AddRowTotal',
                        'Required': 0
                    },
                    'ColumnAttribute': {
                        'Description': 'The attribute in the raw data containing the column names of the pivot matrix.',
                        'Label': 'Column attribute raw data',
                        'Name': 'ColumnAttribute',
                        'Required': 1
                    },
                    'Columns': {
                        'Description': 'You can give an array of column names or a simple select statement returning the column list.',
                        'Label': 'Columns',
                        'Name': 'Columns',
                        'Required': 1
                    },
                    'CountAttribute': {
                        'Description': 'The name of the attribute containing the count in the raw data. If omitted the occurences of the relevant values will be counted.',
                        'Label': 'Count attribute in raw data',
                        'Name': 'CountAttribute',
                        'Required': 0
                    }
                }
            }
        }
    };

}