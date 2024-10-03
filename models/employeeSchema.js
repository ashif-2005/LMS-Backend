const db = require('mongoose');

const schema = new db.Schema(
    {
        empId: {
            type: String,
            required: true,
            unique: true
        },
        empName: {
            type: String,
            required: true
        },
        empMail: {
            type: String,
            required: true,
            unique: true
        },
        empPhone: {
            type: String,
            required: true,
            unique: true
        },
        role: {
            type: String,
            enum: ['Admin', 'Manager', '3P', 'GVR', 'HR', "Admin"],
            default: '3P'
        },
        employees: {
            type: Array,
            default: []
        },
        manager: {
            type: String,
            required: true
        },
        designation: {
            type: String,
            required: true
        },
        reportionManager: {
            type: String,
            required: true
        },
        dateOfJoining: {
            type: String,
            required: true
        },
        function: {
            type: String,
            required: true
        },
        department: {
            type: String,
            required: true
        },
        level: {
            type: String,
            required: true
        },
        location: {
            type: String,
            required: true
        },
        isPaternity: {
            type: Boolean,
            default: false
        },
        isAdpt: {
            type: Boolean,
            default: false
        },
        permissionEligible: {
            type: Number,
            default: 4
        },
        permissionAvailed: {
            type: Number,
            default: 0
        },
        otp: {
            type: String,
            default: '000000'
        }
    },
    {
        timestamps: true
    }
);

const EmpModel = db.model('employee', schema)
module.exports = { EmpModel }
