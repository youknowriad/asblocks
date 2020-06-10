import * as Y from "yjs";
import { useEffect, useRef, useState } from "@wordpress/element";
import { WebrtcProvider } from "y-webrtc";
import simpleDiff from "./simple-diff";

const instances = {};
export function useSyncEdits(ownerKey, encriptionKeyString) {
  const [blocks, _setBlocks] = useState([]);
  const [setBlocks, setSetBlocks] = useState(() => (newBlocks) =>
    _setBlocks(newBlocks)
  );
  const [peers, setPeers] = useState([]);

  const [, forceRender] = useState();
  const forceRenderRef = useRef(() => forceRender({}));
  useEffect(() => {
    const instanceKey = `${ownerKey}|${encriptionKeyString}`;
    if (!instances[instanceKey]) {
      const yDoc = new Y.Doc();
      const blocks = yDoc.getArray("blocks");

      instances[instanceKey] = {
        yDoc,
        blocks,
        setBlocks(newBlocks) {
          const blocksDiff = simpleDiff(blocks.toArray(), newBlocks);
          yDoc.transact(() => {
            blocks.delete(blocksDiff.index, blocksDiff.remove);
            blocks.insert(blocksDiff.index, blocksDiff.insert);
          });
        },
        provider: new WebrtcProvider(ownerKey, yDoc, {
          password: encriptionKeyString,
        }),
      };
    }

    _setBlocks(instances[instanceKey].blocks);
    setSetBlocks(() => instances[instanceKey].setBlocks);
    instances[instanceKey].provider.on("peers", ({ webrtcPeers }) =>
      setPeers(webrtcPeers)
    );

    const maybeForceRender = forceRenderRef.current;
    instances[instanceKey].blocks.observeDeep(maybeForceRender);
    return () => instances[instanceKey].blocks.unobserveDeep(maybeForceRender);
  }, [ownerKey, encriptionKeyString]);

  return {
    blocks: blocks.toArray?.() || blocks,
    setBlocks,
    peers,
  };
}
