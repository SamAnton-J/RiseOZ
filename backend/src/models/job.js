const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    producer: { type: mongoose.Schema.Types.ObjectId, ref: 'Producer', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skillsRequired: [{ type: String }],
    employmentType: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Freelance'] },
    location: { type: String },
    salary: { type: Number },
    type: { type: String, enum: ['job', 'post'], default: 'job' },
    transactionHash: { type: String, default: "" },
    paymentStatus: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    network: { type: String, default: "" }, // e.g. 'Polygon Mumbai Testnet'
    tags: [{ type: String }],
    postedDate: { type: Date, default: Date.now },
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Freelancer' }],
});

const Job = mongoose.model('Job', jobSchema);

module.exports = {
    Job
}