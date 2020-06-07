import {
  isShallowEqualArrays,
  isShallowEqualObjects,
} from "@wordpress/is-shallow-equal";
import { useEffect, useRef } from "@wordpress/element";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { encrypt, decrypt } from "../../lib/crypto";
import { config } from "../../config/index";

export const getBlocksMap = (blocks = []) =>
  blocks.reduce((map, block, index) => {
    map[block.clientId] = { block, index };

    return {
      ...map,
      ...getBlocksMap(block.innerBlocks),
    };
  }, {});

export function getBlockVersions(currentVersions, oldBlocks, newBlocks) {
  if (oldBlocks === newBlocks) {
    return currentVersions;
  }

  const oldBlocksMap = getBlocksMap(oldBlocks);
  const newVersions = { ...currentVersions };

  const fillVersions = (blocks = []) => {
    blocks.forEach((block) => {
      if (!currentVersions[block.clientId]) {
        newVersions[block.clientId] = { version: 1, nonce: uuidv4() };
      } else if (
        block.attributes !== oldBlocksMap[block.clientId].block.attributes
      ) {
        newVersions[block.clientId] = {
          version: currentVersions[block.clientId].version + 1,
          nonce: uuidv4(),
        };
      }
      if (
        !currentVersions[block.clientId] ||
        block.innerBlocks !== oldBlocksMap[block.clientId].block.innerBlocks
      ) {
        fillVersions(block.innerBlocks);
      }
    });
  };

  fillVersions(newBlocks);

  return newVersions;
}

export function getPositionVersions(
  currentVersions,
  oldBlocks = [],
  newBlocks = [],
  parent = ""
) {
  if (oldBlocks === newBlocks) {
    return currentVersions;
  }

  const oldBlocksMap = getBlocksMap(oldBlocks);
  const getBlockIds = (blocks) => blocks.map((block) => block.clientId);
  if (!currentVersions[parent]) {
    currentVersions[parent] = { version: 1, nonce: uuidv4() };
  } else if (
    !isShallowEqualArrays(getBlockIds(newBlocks), getBlockIds(oldBlocks))
  ) {
    currentVersions[parent] = {
      version: currentVersions[parent].version + 1,
      nonce: uuidv4(),
    };
  }

  newBlocks.forEach((block) => {
    const oldInnerBlocks = oldBlocksMap[block.clientId]
      ? oldBlocksMap[block.clientId].block.innerBlocks
      : [];
    currentVersions = getPositionVersions(
      currentVersions,
      oldInnerBlocks,
      block.innerBlocks,
      block.clientId
    );
  });

  return currentVersions;
}

export function getDeletedBlocks(oldBlocks, newBlocks) {
  const deletedBlocks = {};
  const newBlocksMap = getBlocksMap(newBlocks);

  const checkDeletedBlocks = (blocks = []) => {
    blocks.forEach((block) => {
      if (!newBlocksMap.hasOwnProperty(block.clientId)) {
        deletedBlocks[block.clientId] = true;
      }
      checkDeletedBlocks(block.innerBlocks);
    });
  };
  checkDeletedBlocks(oldBlocks);

  return deletedBlocks;
}

export function pickBlock(
  blockA,
  blockB,
  versionA,
  versionB,
  hasInnerBlockChanges,
  innerBlocks
) {
  const [pick] = compareVersions(blockA, blockB, versionA, versionB);
  const version = blockA === pick ? versionA : versionB;
  const block = hasInnerBlockChanges
    ? {
        ...pick,
        innerBlocks,
      }
    : pick;

  return { block, version };
}

export function compareVersions(valueA, valueB, versionA, versionB) {
  if (!versionA) {
    return [valueB, valueA];
  }

  if (!versionB) {
    return [valueA, valueB];
  }

  // If the local block is more recent (bigger version)
  // or remote and local blocks have the same version and nonces
  if (
    versionA.version > versionB.version ||
    (versionA.version === versionB.version && versionA.nonce === versionB.nonce)
  ) {
    return [valueA, valueB];
  }

  // Both local and remote blocks have updates, reconcile the conflict deterministically.
  // resolve conflicting edits deterministically by taking the one with the lowest versionNonce
  if (
    versionA.version === versionB.version &&
    versionA.nonce !== versionB.nonce
  ) {
    if (versionA.nonce < versionB.nonce) {
      return [valueA, valueB];
    }

    return [valueB, valueA];
  }

  return [valueB, valueA];
}

const reconcileBlocks = (
  blocksA = [],
  blocksB = [],
  mapA,
  mapB,
  blockVersionsA,
  blockVersionsB,
  positionVersionA,
  positionVersionB,
  deletedBlocks,
  currentId = ""
) => {
  const [primaryBlocks, secondaryBlocks] = compareVersions(
    blocksA,
    blocksB,
    positionVersionA[currentId],
    positionVersionB[currentId]
  );
  const shouldSwitch = primaryBlocks === blocksB;
  const primaryMap = !shouldSwitch ? mapA : mapB;
  const secondaryMap = shouldSwitch ? mapA : mapB;
  const primaryVersions = !shouldSwitch ? blockVersionsA : blockVersionsB;
  const secondaryVersions = shouldSwitch ? blockVersionsA : blockVersionsB;
  const primaryPositionVersions = !shouldSwitch
    ? positionVersionA
    : positionVersionB;
  const secondaryPositionVersions = shouldSwitch
    ? positionVersionA
    : positionVersionB;

  let hasChanges =
    blocksA.length !== blocksB.length || primaryBlocks !== blocksA;
  let newVersions = {};
  const alreadyAddedBlocks = {};
  let newBlocks = primaryBlocks.reduce((blocks, block) => {
    alreadyAddedBlocks[block.clientId] = true;

    // If the remote block has been deleted locally.
    if (deletedBlocks[block.clientId]) {
      return blocks;
    }

    // If the remote block is a new block
    if (!secondaryMap.hasOwnProperty(block.clientId)) {
      blocks.push(block);
      newVersions[block.clientId] = primaryVersions[block.clientId];
      hasChanges = hasChanges || block !== mapA[block.clientId].block;
      return blocks;
    }

    // Reconcile nested blocks
    const {
      blocks: innerBlocks,
      versions: innerBlocksVersions,
      hasChanges: hasInnerBlockChanges,
    } = reconcileBlocks(
      secondaryMap[block.clientId].block.innerBlocks,
      block.innerBlocks,
      secondaryMap,
      primaryMap,
      secondaryVersions,
      primaryVersions,
      secondaryPositionVersions,
      primaryPositionVersions,
      deletedBlocks,
      block.clientId
    );
    newVersions = {
      ...newVersions,
      ...innerBlocksVersions,
    };

    // Pick a block depending on the version
    // and apply the right inner blocks
    const { block: newBlock, version: newVersion } = pickBlock(
      secondaryMap[block.clientId].block,
      block,
      secondaryVersions[block.clientId],
      primaryVersions[block.clientId],
      hasInnerBlockChanges,
      innerBlocks
    );

    hasChanges = hasChanges || newBlock !== mapA[block.clientId].block;
    blocks.push(newBlock);
    newVersions[newBlock.clientId] = newVersion;

    return blocks;
  }, []);

  secondaryBlocks.forEach((block) => {
    if (
      !alreadyAddedBlocks[block.clientId] &&
      !deletedBlocks[block.clientId] &&
      !primaryMap.hasOwnProperty(block.clientId)
    ) {
      const { index } = secondaryMap[block.clientId];
      newBlocks = [
        ...newBlocks.slice(0, index),
        block,
        ...newBlocks.slice(index),
      ];
      newVersions[block.clientId] = secondaryVersions[block.clientId];
    }
  });

  return { blocks: newBlocks, hasChanges, versions: newVersions };
};

export function mergeBlocks(
  localBlocks,
  remoteBlocks,
  localBlocksVersions,
  remoteBlocksVersions,
  localPositionsVersions,
  remotePositionsVersions,
  deletedBlocks = {}
) {
  // Prepare local blocks map
  const localBlocksMap = getBlocksMap(localBlocks);
  const remoteBlocksMap = getBlocksMap(remoteBlocks);

  const { hasChanges, blocks, versions } = reconcileBlocks(
    localBlocks,
    remoteBlocks,
    localBlocksMap,
    remoteBlocksMap,
    localBlocksVersions,
    remoteBlocksVersions,
    localPositionsVersions,
    remotePositionsVersions,
    deletedBlocks
  );

  if (!hasChanges) {
    return { blocks: localBlocks, versions: localBlocksVersions };
  } else {
    return { blocks, versions };
  }
}

export function useSyncEdits(post, onChange, encryptionKey) {
  const socket = io(config.collabServer);
  const identity = useRef(uuidv4());
  const lastPersisted = useRef(post);
  const blocks = useRef(post.blocks);
  const deletedBlocks = useRef({});
  const blockVersions = useRef({});
  const positionVersions = useRef({});

  useEffect(() => {
    if (post === lastPersisted.current) {
      return;
    }
    async function emitUpdate() {
      deletedBlocks.current = getDeletedBlocks(blocks.current, post.blocks);
      const newBlockVersions = getBlockVersions(
        blockVersions.current,
        blocks.current,
        post.blocks
      );
      const newPositionVersions = getPositionVersions(
        positionVersions.current,
        blocks.current,
        post.blocks
      );
      // This check shouldn't be necessary but it seems a new post instance
      // is  generated too often.
      if (
        isShallowEqualObjects(newBlockVersions, blockVersions.current) &&
        isShallowEqualObjects(newPositionVersions, positionVersions.current) &&
        post.title === lastPersisted.current.title
      ) {
        blockVersions.current = newBlockVersions;
        positionVersions.current = newPositionVersions;
        blocks.current = post.blocks;
        lastPersisted.current = post;
        return;
      }
      blockVersions.current = newBlockVersions;
      positionVersions.current = newPositionVersions;
      blocks.current = post.blocks;
      lastPersisted.current = post;

      socket.emit(
        "server-broadcast",
        post._id,
        await encrypt(
          {
            type: "update",
            post,
            positionVersions: positionVersions.current,
            blockVersions: blockVersions.current,
            deletedBlocks: deletedBlocks.current,
            identity: identity.current,
          },
          encryptionKey
        )
      );
    }

    emitUpdate();
  }, [post]);

  useEffect(() => {
    socket.emit("join-room", post._id);
    socket.on("client-broadcast", async (msg) => {
      const action = await decrypt(msg, encryptionKey);
      if (action.identity === identity.current) {
        return;
      }

      switch (action.type) {
        case "update":
          const mergedDeletedBlocks = {
            ...deletedBlocks.current,
            ...action.deletedBlocks,
          };

          const merged = mergeBlocks(
            blocks.current,
            action.post.blocks,
            blockVersions.current,
            action.blockVersions,
            positionVersions.current,
            action.positionVersions,
            mergedDeletedBlocks
          );

          deletedBlocks.current = mergedDeletedBlocks;
          blockVersions.current = merged.versions;
          positionVersions.current = getPositionVersions(
            positionVersions.current,
            blocks.current,
            merged.blocks
          );
          blocks.current = merged.blocks;
          lastPersisted.current = {
            ...action.post,
            blocks: merged.blocks,
          };

          onChange(lastPersisted.current);
          break;
      }
    });
  }, []);
}
