import { RecordCreated as RecordCreatedEvent } from "../generated/SimpleRecord/SimpleRecord"
import { RecordCreated } from "../generated/schema"

export function handleRecordCreated(event: RecordCreatedEvent): void {
  let entity = new RecordCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.SimpleRecord_id = event.params.id
  entity.data = event.params.data
  entity.creator = event.params.creator

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
