'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')

let id = 1
let AgentStub = null  
let db = null
let single = Object.assign({}, agentFixtures.single)
let sandbox = null

test.beforeEach(async()=>{
    sandbox = sinon.createSandbox()
    AgentStub = {
        hasMany:sandbox.spy()
    }
    // Model findbyId Stub
    AgentStub.findById = sandbox.stub()
    AgentStub.findById.withArgs(id).return(Promise.resolve(agentFixtures.byId(id)))

    const setupDatabse = proxyquire('../', {
        './models/agent': () => AgentStub,
        './models/metric': ()=>MetricStub
    })
    db = await setupDatabse(config)
})

test.afterEach(()=>{
    sandbox && sandbox.restore()
})

let MetricStub = {
    belongsTo: sinon.spy()
}

let config = {
    logging: function () {}
}

test('Agent', t=>{
    t.truthy(db.Agent, 'Agent service should exist')
})

test.serial('Setup', t=>{
    t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
    t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
    t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was execnuted')
    t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')
})

test.serial('Agent#findById', async t=>{
    let agent = await db.Agent.findById(id)

    t.deepEqual(agent, agentFixtures.byId(id), 'should be the same')
})