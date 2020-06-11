// Converts the shared block data types into a renderable block list.
export default function yDocBlocksToArray(yDocBlocks, clientId = "") {
  let order = yDocBlocks.get("order");
  order = order.get(clientId)?.toArray();
  if (!order) return [];
  const byClientId = yDocBlocks.get("byClientId");

  return order.map((clientId) => ({
    ...byClientId.get(clientId),
    innerBlocks: yDocBlocksToArray(yDocBlocks, clientId),
  }));
}
