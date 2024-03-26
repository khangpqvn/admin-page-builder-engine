const moment = require('moment');
let reports = {};
const excel = require('node-excel-export');
const _ = require('lodash');
module.exports = {


    friendlyName: 'Xuất file excel không chỉnh sửa',


    description: '',


    inputs: {
        data: { type: 'ref', description: 'Dữ liệu cần sinh file excel', required: true },
        header: { type: 'ref', description: 'Header file excel' }
    },


    exits: {

        success: {
            description: 'All done.',
        },

    },
    sync: true,

    fn: function (inputs, exits) {
        let { data, header } = inputs;
        header = header ? header : {};
        const styles = {
            headerDark: {
                fill: {
                    fgColor: {
                        rgb: 'dcdcdc'
                    }
                },
                font: {
                    color: {
                        rgb: '000000'
                    },
                    sz: 12,
                    bold: true,
                    underline: false
                }
            },
            cellWhite: {
                fill: {
                    fgColor: {
                        rgb: 'ffffff'
                    }
                }
            },
            cellPink: {
                fill: {
                    fgColor: {
                        rgb: 'FFFFCCFF'
                    }
                }
            },
            cellGreen: {
                fill: {
                    fgColor: {
                        rgb: 'FF00FF00'
                    }
                }
            }
        };

        let types = ['number', 'string', 'date', 'boolean']
        const specification = {};
        //fix data
        for (var i in header) {
            // console.log(typeof (data[0][i]));
            // if (!_.includes(types, typeof (data[0][i]))) {
            //     continue;
            // }
            specification[i] = { // <- the key should match the actual data key
                displayName: header[i], // <- Here you specify the column header
                headerStyle: styles.headerDark, // <- Header style
                width: 120 // <- width in pixels
            }
        }


        // Create the excel report.
        // This function will return Buffer
        const report = excel.buildExport(
            [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                {
                    name: 'Report', // <- Specify sheet name (optional)
                    // heading: heading, // <- Raw heading array (optional)
                    // merges: merges, // <- Merge cell ranges
                    specification: specification, // <- Report specification
                    data // <-- Report data
                }
            ]
        );
        return exits.success(report);
    }
};