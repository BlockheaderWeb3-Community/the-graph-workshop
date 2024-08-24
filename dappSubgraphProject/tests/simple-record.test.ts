import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { RecordCreated } from "../generated/schema"
import { RecordCreated as RecordCreatedEvent } from "../generated/SimpleRecord/SimpleRecord"
import { handleRecordCreated } from "../src/simple-record"
import { createRecordCreatedEvent } from "./simple-record-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let id = BigInt.fromI32(234)
    let data = "Example string value"
    let creator = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newRecordCreatedEvent = createRecordCreatedEvent(id, data, creator)
    handleRecordCreated(newRecordCreatedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("RecordCreated created and stored", () => {
    assert.entityCount("RecordCreated", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "RecordCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "data",
      "Example string value"
    )
    assert.fieldEquals(
      "RecordCreated",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "creator",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
