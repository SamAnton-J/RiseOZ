const db = require('../../config/db');
const { Producer } = require('../models/producer');
const { Freelancer } = require('../models/freelancer');
const { Job } = require('../models/job');
const { ConnectionRequest } = require('../models/connection');
const Message = require('../models/message');

async function run() {
    try {
        // Wait for database connection to be ready
        await new Promise((resolve, reject) => {
            if (db.readyState === 1) {
                resolve();
            } else {
                db.once('open', resolve);
                db.once('error', reject);
            }
        });

        await Promise.all([
            Producer.deleteMany({}),
            Freelancer.deleteMany({}),
            Job.deleteMany({}),
            ConnectionRequest.deleteMany({}),
            Message.deleteMany({}),
        ]);
        console.log('Database cleared: Producers, Freelancers, Jobs, ConnectionRequests, Messages');
    } catch (error) {
        console.error('Clear DB failed:', error);
    } finally {
        setTimeout(() => process.exit(0), 300);
    }
}

run();


