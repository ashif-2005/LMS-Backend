const db = require('mongoose')

const schema = new db.Schema(
    {
        empId: {
            type: String,
            required: true
        },
        empName:{
            type: String,
            required: true
        },
        role:{
            type: String,
            enum: ['Admin', 'Manager', '3P', 'GVR'],
            default: '3P'
        },
        manager: {
            type: String,
            required: true
        },
        leaveType: {
            type: String,
            enum: ['Casual Leave', 'Privilege Leave', 'Paternity Leave', 'Adoption Leave', 'LOP'],
            default: 'Casual Leave'
        },
        from: {
            type: Object,
            required: true
        },
        to: {
            type: Object,
            required: true
        },
        numberOfDays: {
            type: Number,
            required: true
        },
        leaveDays: {
            type: Number,
            required: true,
        },
        days: {
            type: Array,
            default: []
        },
        reasonType: {
            type: String,
            enum: ['Personal', 'Medical', 'Paternity', 'Family Function', 'Others'],
            default: 'Personal'
        },
        reason: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            enum: ['Pending', 'Approved', 'Denied', 'Withdrawn'],
            default: 'Pending'
        },
        today:{
            type: String,
            required: true
        },
        LOP: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

const LeaveModel = db.model('leave', schema)
module.exports = { LeaveModel }
