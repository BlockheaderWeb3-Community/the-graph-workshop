import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import { RecordCreated } from "../generated/SimpleRecord/SimpleRecord"

export function createRecordCreatedEvent(
  id: BigInt,
  data: string,
  creator: Address
): RecordCreated {
  let recordCreatedEvent = changetype<RecordCreated>(newMockEvent())

  recordCreatedEvent.parameters = new Array()

  recordCreatedEvent.parameters.push(
    new ethereum.EventParam("id", ethereum.Value.fromUnsignedBigInt(id))
  )
  recordCreatedEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromString(data))
  )
  recordCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )

  return recordCreatedEvent
}
