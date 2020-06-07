import {
  mergeBlocks,
  pickBlock,
  getDeletedBlocks,
  getBlockVersions,
  getPositionVersions,
} from "./sync";

describe("getDeletedBlocks", () => {
  test("should return the deleted blocks and inner blocks", () => {
    const oldBlocks = [
      {
        clientId: "1",
        innerBlocks: [
          {
            clientId: "2",
            innerBlocks: [],
          },
        ],
      },
      { clientId: "3" },
      { clientId: "4" },
    ];

    const newBlocks = [{ clientId: "3" }];

    expect(getDeletedBlocks(oldBlocks, newBlocks)).toEqual({
      "1": true,
      "2": true,
      "4": true,
    });
  });
});

describe("getBlockVersions", () => {
  test("should keep the same versions if the blocks didn't change", () => {
    const currentVersions = {
      "1": { version: 1, nonce: "1" },
    };
    const oldBlocks = [
      {
        clientId: "1",
        attributes: {},
        innerBlocks: [],
      },
    ];
    const newBlocks = oldBlocks;

    expect(getBlockVersions(currentVersions, oldBlocks, newBlocks)).toEqual(
      currentVersions
    );
  });

  test("should increment block version on change", () => {
    const currentVersions = {
      "1": { version: 1, nonce: "1" },
    };
    const oldBlocks = [
      {
        clientId: "1",
        attributes: {},
        innerBlocks: [],
      },
    ];
    const newBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "new attributes",
        },
        innerBlocks: [],
      },
    ];

    expect(
      getBlockVersions(currentVersions, oldBlocks, newBlocks)["1"].version
    ).toEqual(2);
  });

  test("should add block version for new block", () => {
    const currentVersions = {
      "1": { version: 1, nonce: "1" },
    };
    const oldBlocks = [
      {
        clientId: "1",
        attributes: {},
        innerBlocks: [],
      },
    ];
    const newBlocks = [
      oldBlocks[0],
      {
        clientId: "2",
        attributes: {},
        innerBlocks: [],
      },
    ];

    const result = getBlockVersions(currentVersions, oldBlocks, newBlocks);

    expect(result["1"]).toEqual(currentVersions["1"]);
    expect(result["2"].version).toEqual(1);
  });

  test("should increment block version on change", () => {
    const currentVersions = {
      "1": { version: 1, nonce: "1" },
    };
    const oldBlocks = [
      {
        clientId: "1",
        attributes: {},
        innerBlocks: [],
      },
    ];
    const newBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "new attributes",
        },
        innerBlocks: [],
      },
    ];

    expect(
      getBlockVersions(currentVersions, oldBlocks, newBlocks)["1"].version
    ).toEqual(2);
  });

  test("should increment inner block version on change", () => {
    const currentVersions = {
      "1": { version: 1, nonce: "1" },
      "2": { version: 1, nonce: "1" },
    };
    const oldBlocks = [
      {
        clientId: "1",
        attributes: {},
        innerBlocks: [
          {
            clientId: "2",
            attributes: {},
            innerBlocks: [],
          },
        ],
      },
    ];
    const newBlocks = [
      {
        clientId: "1",
        attributes: oldBlocks[0].attributes,
        innerBlocks: [
          {
            clientId: "2",
            attributes: {
              content: "new attributes",
            },
            innerBlocks: [],
          },
        ],
      },
    ];

    const result = getBlockVersions(currentVersions, oldBlocks, newBlocks);

    expect(result["1"]).toEqual(currentVersions["1"]);
    expect(result["2"].version).toEqual(2);
  });
});

describe("getPositionVersions", () => {
  test("should keep the same version if no change", () => {
    const currentVersions = {
      "": { version: 1, nonce: 1 },
    };
    const oldBlocks = [];
    const newBlocks = oldBlocks;
    const result = getPositionVersions(currentVersions, oldBlocks, newBlocks);
    expect(result).toEqual(currentVersions);
  });

  test("should increment the version on change", () => {
    const currentVersions = {
      "": { version: 1, nonce: 1 },
    };
    const oldBlocks = [];
    const newBlocks = [{ clientId: "1", innerBlocks: [] }];
    const result = getPositionVersions(currentVersions, oldBlocks, newBlocks);
    expect(result[""].version).toEqual(2);
    expect(result["1"].version).toEqual(1);
  });

  test("should keep the same version if the order of the blocks don't change", () => {
    const currentVersions = {
      "": { version: 1, nonce: 1 },
      "1": { version: 1, nonce: 1 },
    };
    const oldBlocks = [
      { clientId: "1", attributes: { content: "1" }, innerBlocks: [] },
    ];
    const newBlocks = [
      { clientId: "1", attributes: { content: "2" }, innerBlocks: [] },
    ];
    const result = getPositionVersions(currentVersions, oldBlocks, newBlocks);
    expect(result).toEqual(currentVersions);
  });
});

describe("pickBlock", () => {
  test("should keep local block if more recent", () => {
    const localBlock = {
      clientId: "1",
      attributes: {
        content: "update",
      },
      innerBlocks: [],
    };
    const localBlockVersion = { version: 2, nonce: 1 };

    const remoteBlock = {
      clientId: "1",
      attributes: {
        content: "original",
      },
      innerBlocks: [],
    };
    const remoteBlockVersion = { version: 1, nonce: 1 };

    const result = pickBlock(
      localBlock,
      remoteBlock,
      localBlockVersion,
      remoteBlockVersion,
      false
    );

    expect(result.block).toBe(localBlock);
    expect(result.version).toEqual(localBlockVersion);

    // Should be deterministic
    expect(result).toEqual(
      pickBlock(
        remoteBlock,
        localBlock,
        remoteBlockVersion,
        localBlockVersion,
        false
      )
    );
  });

  test("should keep remote block if more recent", () => {
    const localBlock = {
      clientId: "1",
      attributes: {
        content: "original",
      },
      innerBlocks: [],
    };
    const localBlockVersion = { version: 1, nonce: 1 };

    const remoteBlock = {
      clientId: "1",
      attributes: {
        content: "update",
      },
      innerBlocks: [],
    };
    const remoteBlockVersion = { version: 2, nonce: 1 };

    const result = pickBlock(
      localBlock,
      remoteBlock,
      localBlockVersion,
      remoteBlockVersion,
      false
    );

    expect(result.block).toBe(remoteBlock);
    expect(result.version).toEqual(remoteBlockVersion);

    // Should be deterministic
    expect(result).toEqual(
      pickBlock(
        remoteBlock,
        localBlock,
        remoteBlockVersion,
        localBlockVersion,
        false
      )
    );
  });

  test("should keep the block with the smallest nonce", () => {
    const localBlock = {
      clientId: "1",
      attributes: {
        content: "update 1",
      },
      innerBlocks: [],
    };
    const localBlockVersion = { version: 2, nonce: 1 };

    const remoteBlock = {
      clientId: "1",
      attributes: {
        content: "update 2",
      },
      innerBlocks: [],
    };
    const remoteBlockVersion = { version: 2, nonce: 4 };
    const result = pickBlock(
      localBlock,
      remoteBlock,
      localBlockVersion,
      remoteBlockVersion,
      false
    );

    expect(result.block).toEqual(localBlock);
    expect(result.version).toEqual(localBlockVersion);

    // Should be deterministic
    expect(result).toEqual(
      pickBlock(
        remoteBlock,
        localBlock,
        remoteBlockVersion,
        localBlockVersion,
        false
      )
    );
  });

  test("should merge attributes with update inner blocks", () => {
    const localBlock = {
      clientId: "1",
      attributes: {
        content: "updated parent",
      },
      innerBlocks: [],
    };
    const localBlockVersion = { version: 2, nonce: 1 };

    const remoteBlock = {
      clientId: "1",
      attributes: {
        content: "original parent",
      },
      innerBlocks: [
        {
          clientId: "2",
          attributes: {
            content: "updated children",
          },
          innerBlocks: [],
        },
      ],
    };
    const remoteBlockVersion = { version: 1, nonce: 1 };

    const result = pickBlock(
      localBlock,
      remoteBlock,
      localBlockVersion,
      remoteBlockVersion,
      true,
      remoteBlock.innerBlocks
    );

    expect(result.block).toEqual({
      clientId: "1",
      attributes: {
        content: "updated parent",
      },
      innerBlocks: [
        {
          clientId: "2",
          attributes: {
            content: "updated children",
          },
          innerBlocks: [],
        },
      ],
    });
    expect(result.version).toEqual({ version: 2, nonce: 1 });

    // Should be deterministic
    expect(result).toEqual(
      pickBlock(
        remoteBlock,
        localBlock,
        remoteBlockVersion,
        localBlockVersion,
        true,
        remoteBlock.innerBlocks
      )
    );
  });
});

describe("mergeBlocks", () => {
  test("should pick blocks based on version", () => {
    const localBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "original",
        },
        innerBlocks: [],
      },
    ];
    const localBlockVersions = {
      "1": { version: 1, nonce: 1 },
    };
    const localPositionVersions = {
      "": { version: 1, nonce: 1 },
    };

    const remoteBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "update",
        },
        innerBlocks: [],
      },
    ];
    const remoteBlockVersions = {
      "1": { version: 2, nonce: 1 },
    };
    const remotePositionVersions = {
      "": { version: 1, nonce: 1 },
    };

    const { blocks, versions } = mergeBlocks(
      localBlocks,
      remoteBlocks,
      localBlockVersions,
      remoteBlockVersions,
      localPositionVersions,
      remotePositionVersions
    );

    expect(blocks).toEqual(remoteBlocks);
    expect(versions).toEqual(remoteBlockVersions);

    // Should be deterministic
    expect(blocks).toEqual(
      mergeBlocks(
        remoteBlocks,
        localBlocks,
        remoteBlockVersions,
        localBlockVersions,
        remotePositionVersions,
        localPositionVersions
      ).blocks
    );
  });

  test("should merge edits to two different blocks", () => {
    const localBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "original",
        },
        innerBlocks: [],
      },
      {
        clientId: "2",
        attributes: {
          content: "update",
        },
        innerBlocks: [],
      },
    ];
    const localBlockVersions = {
      "1": { version: 1, nonce: 1 },
      "2": { version: 2, nonce: 1 },
    };
    const localPositionVersions = {
      "": { version: 1, nonce: 1 },
    };

    const remoteBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "update",
        },
        innerBlocks: [],
      },
      {
        clientId: "2",
        attributes: {
          content: "original",
        },
        innerBlocks: [],
      },
    ];
    const remoteBlockVersions = {
      "1": { version: 2, nonce: 1 },
      "2": { version: 1, nonce: 1 },
    };
    const remotePositionVersions = {
      "": { version: 1, nonce: 1 },
    };

    const { blocks, versions } = mergeBlocks(
      localBlocks,
      remoteBlocks,
      localBlockVersions,
      remoteBlockVersions,
      localPositionVersions,
      remotePositionVersions
    );

    expect(blocks).toEqual([
      {
        clientId: "1",
        attributes: {
          content: "update",
        },
        innerBlocks: [],
      },
      {
        clientId: "2",
        attributes: {
          content: "update",
        },
        innerBlocks: [],
      },
    ]);
    expect(versions).toEqual({
      "1": { version: 2, nonce: 1 },
      "2": { version: 2, nonce: 1 },
    });

    // Should be deterministic
    expect(blocks).toEqual(
      mergeBlocks(
        remoteBlocks,
        localBlocks,
        remoteBlockVersions,
        localBlockVersions,
        remotePositionVersions,
        localPositionVersions
      ).blocks
    );
  });

  test("should replace inner blocks", () => {
    const localBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "parent",
        },
        innerBlocks: [
          {
            clientId: "2",
            attributes: {
              content: "original",
            },
            innerBlocks: [],
          },
        ],
      },
    ];
    const localBlockVersions = {
      "1": { version: 1, nonce: 1 },
      "2": { version: 1, nonce: 1 },
    };
    const localPositionVersions = {
      "": { version: 1, nonce: 1 },
      "1": { version: 1, nonce: 1 },
    };

    const remoteBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "parent",
        },
        innerBlocks: [
          {
            clientId: "2",
            attributes: {
              content: "updated",
            },
            innerBlocks: [],
          },
        ],
      },
    ];
    const remoteBlockVersions = {
      "1": { version: 1, nonce: 1 },
      "2": { version: 2, nonce: 1 },
    };
    const remotePositionVersions = {
      "": { version: 1, nonce: 1 },
      "1": { version: 1, nonce: 1 },
    };

    const { blocks, versions } = mergeBlocks(
      localBlocks,
      remoteBlocks,
      localBlockVersions,
      remoteBlockVersions,
      localPositionVersions,
      remotePositionVersions
    );

    expect(blocks).toEqual(remoteBlocks);
    expect(versions).toEqual({
      "1": { version: 1, nonce: 1 },
      "2": { version: 2, nonce: 1 },
    });

    // Should be deterministic
    expect(blocks).toEqual(
      mergeBlocks(
        remoteBlocks,
        localBlocks,
        remoteBlockVersions,
        localBlockVersions,
        remotePositionVersions,
        localPositionVersions
      ).blocks
    );
  });

  test("should merge local attributes with newer remote inner blocks", () => {
    const localBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "updated parent",
        },
        innerBlocks: [
          {
            clientId: "2",
            attributes: {
              content: "original children",
            },
            innerBlocks: [],
          },
        ],
      },
    ];
    const localBlockVersions = {
      "1": { version: 2, nonce: 1 },
      "2": { version: 1, nonce: 1 },
    };
    const localPositionVersions = {
      "": { version: 1, nonce: 1 },
      "1": { version: 1, nonce: 1 },
    };

    const remoteBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "original parent",
        },
        innerBlocks: [
          {
            clientId: "2",
            attributes: {
              content: "updated children",
            },
            innerBlocks: [],
          },
        ],
      },
    ];
    const remoteBlockVersions = {
      "1": { version: 1, nonce: 1 },
      "2": { version: 2, nonce: 1 },
    };
    const remotePositionVersions = {
      "": { version: 1, nonce: 1 },
      "1": { version: 1, nonce: 1 },
    };

    const { blocks, versions } = mergeBlocks(
      localBlocks,
      remoteBlocks,
      localBlockVersions,
      remoteBlockVersions,
      localPositionVersions,
      remotePositionVersions
    );

    expect(blocks).toEqual([
      {
        clientId: "1",
        attributes: {
          content: "updated parent",
        },
        innerBlocks: [
          {
            clientId: "2",
            attributes: {
              content: "updated children",
            },
            innerBlocks: [],
          },
        ],
      },
    ]);
    expect(versions).toEqual({
      "1": { version: 2, nonce: 1 },
      "2": { version: 2, nonce: 1 },
    });

    // Should be deterministic
    expect(blocks).toEqual(
      mergeBlocks(
        remoteBlocks,
        localBlocks,
        remoteBlockVersions,
        localBlockVersions,
        remotePositionVersions,
        localPositionVersions
      ).blocks
    );
  });

  test("should add new block and keep local updates", () => {
    const localBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "updated",
        },
        innerBlocks: [],
      },
    ];
    const localBlockVersions = {
      "1": { version: 2, nonce: 1 },
    };
    const localPositionVersions = {
      "": { version: 1, nonce: 1 },
    };

    const remoteBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "original",
        },
        innerBlocks: [],
      },
      {
        clientId: "2",
        attributes: {
          content: "new",
        },
        innerBlocks: [],
      },
    ];
    const remoteBlockVersions = {
      "1": { version: 1, nonce: 1 },
      "2": { version: 1, nonce: 1 },
    };
    const remotePositionVersions = {
      "": { version: 2, nonce: 1 },
    };

    const { blocks, versions } = mergeBlocks(
      localBlocks,
      remoteBlocks,
      localBlockVersions,
      remoteBlockVersions,
      localPositionVersions,
      remotePositionVersions
    );

    expect(blocks).toEqual([
      {
        clientId: "1",
        attributes: {
          content: "updated",
        },
        innerBlocks: [],
      },
      {
        clientId: "2",
        attributes: {
          content: "new",
        },
        innerBlocks: [],
      },
    ]);
    expect(versions).toEqual({
      "1": { version: 2, nonce: 1 },
      "2": { version: 1, nonce: 1 },
    });

    // Should be deterministic
    expect(blocks).toEqual(
      mergeBlocks(
        remoteBlocks,
        localBlocks,
        remoteBlockVersions,
        localBlockVersions,
        remotePositionVersions,
        localPositionVersions
      ).blocks
    );
  });

  test("should remove block regardless of updates", () => {
    const localBlocks = [];
    const localBlockVersions = {};
    const localPositionVersions = {
      "": { version: 2, nonce: 1 },
    };

    const remoteBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "updated",
        },
        innerBlocks: [],
      },
    ];
    const remoteBlockVersions = {
      "1": { version: 2, nonce: 1 },
    };
    const remotePositionVersions = {
      "": { version: 1, nonce: 1 },
    };

    const deletedBlocks = {
      "1": true,
    };

    const { blocks, versions } = mergeBlocks(
      localBlocks,
      remoteBlocks,
      localBlockVersions,
      remoteBlockVersions,
      localPositionVersions,
      remotePositionVersions,
      deletedBlocks
    );

    expect(blocks).toEqual([]);
    expect(versions).toEqual({});

    // Should be deterministic
    expect(blocks).toEqual(
      mergeBlocks(
        remoteBlocks,
        localBlocks,
        remoteBlockVersions,
        localBlockVersions,
        remotePositionVersions,
        localPositionVersions,
        deletedBlocks
      ).blocks
    );
  });

  test("should keep new block", () => {
    const localBlocks = [];
    const localBlockVersions = {};
    const localPositionVersions = {
      "": { version: 1, nonce: 1 },
    };

    const remoteBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "new",
        },
        innerBlocks: [],
      },
    ];
    const remoteBlockVersions = {
      "1": { version: 1, nonce: 1 },
    };
    const remotePositionVersions = {
      "": { version: 2, nonce: 1 },
    };

    const deletedBlocks = {};

    const { blocks, versions } = mergeBlocks(
      localBlocks,
      remoteBlocks,
      localBlockVersions,
      remoteBlockVersions,
      localPositionVersions,
      remotePositionVersions,
      deletedBlocks
    );

    expect(blocks).toEqual([
      {
        clientId: "1",
        attributes: {
          content: "new",
        },
        innerBlocks: [],
      },
    ]);
    expect(versions).toEqual({
      "1": { version: 1, nonce: 1 },
    });

    // Should be deterministic
    expect(blocks).toEqual(
      mergeBlocks(
        remoteBlocks,
        localBlocks,
        remoteBlockVersions,
        localBlockVersions,
        remotePositionVersions,
        localPositionVersions,
        deletedBlocks
      ).blocks
    );
  });

  test("should move blocks", () => {
    const localBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "original 1",
        },
        innerBlocks: [],
      },
      {
        clientId: "2",
        attributes: {
          content: "original 2",
        },
        innerBlocks: [],
      },
    ];
    const localBlockVersions = {
      "1": { version: 1, nonce: 1 },
      "2": { version: 1, nonce: 1 },
    };
    const localPositionVersions = {
      "": { version: 1, nonce: 1 },
    };

    const remoteBlocks = [
      {
        clientId: "2",
        attributes: {
          content: "original 2",
        },
        innerBlocks: [],
      },
      {
        clientId: "1",
        attributes: {
          content: "original 1",
        },
        innerBlocks: [],
      },
    ];
    const remoteBlockVersions = {
      "1": { version: 1, nonce: 1 },
      "2": { version: 1, nonce: 1 },
    };
    const remotePositionVersions = {
      "": { version: 2, nonce: 1 },
    };

    const deletedBlocks = {};

    const { blocks, versions } = mergeBlocks(
      localBlocks,
      remoteBlocks,
      localBlockVersions,
      remoteBlockVersions,
      localPositionVersions,
      remotePositionVersions,
      deletedBlocks
    );

    expect(blocks).toEqual(remoteBlocks);
    expect(versions).toEqual(remoteBlockVersions);

    // Should be deterministic
    expect(blocks).toEqual(
      mergeBlocks(
        remoteBlocks,
        localBlocks,
        remoteBlockVersions,
        localBlockVersions,
        remotePositionVersions,
        localPositionVersions,
        deletedBlocks
      ).blocks
    );
  });

  test("should move block to parent", () => {
    const localBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "original 1",
        },
        innerBlocks: [],
      },
      {
        clientId: "2",
        attributes: {
          content: "original 2",
        },
        innerBlocks: [],
      },
    ];
    const localBlockVersions = {
      "1": { version: 1, nonce: 1 },
      "2": { version: 1, nonce: 1 },
    };
    const localPositionVersions = {
      "": { version: 1, nonce: 1 },
    };

    const remoteBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "original 1",
        },
        innerBlocks: [
          {
            clientId: "2",
            attributes: {
              content: "original 2",
            },
            innerBlocks: [],
          },
        ],
      },
    ];
    const remoteBlockVersions = {
      "1": { version: 1, nonce: 1 },
      "2": { version: 1, nonce: 1 },
    };
    const remotePositionVersions = {
      "": { version: 2, nonce: 1 },
      "1": { version: 1, nonce: 1 },
    };

    const deletedBlocks = {};

    const { blocks, versions } = mergeBlocks(
      localBlocks,
      remoteBlocks,
      localBlockVersions,
      remoteBlockVersions,
      localPositionVersions,
      remotePositionVersions,
      deletedBlocks
    );

    expect(blocks).toEqual(remoteBlocks);
    expect(versions).toEqual(remoteBlockVersions);

    // Should be deterministic
    expect(blocks).toEqual(
      mergeBlocks(
        remoteBlocks,
        localBlocks,
        remoteBlockVersions,
        localBlockVersions,
        remotePositionVersions,
        localPositionVersions,
        deletedBlocks
      ).blocks
    );
  });

  test("should move block outside of parent block", () => {
    const localBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "original 1",
        },
        innerBlocks: [
          {
            clientId: "2",
            attributes: {
              content: "original 2",
            },
            innerBlocks: [],
          },
        ],
      },
    ];
    const localBlockVersions = {
      "1": { version: 1, nonce: 1 },
      "2": { version: 1, nonce: 1 },
    };
    const localPositionVersions = {
      "": { version: 1, nonce: 1 },
      "1": { version: 1, nonce: 1 },
    };

    const remoteBlocks = [
      {
        clientId: "1",
        attributes: {
          content: "original 1",
        },
        innerBlocks: [],
      },
      {
        clientId: "2",
        attributes: {
          content: "original 2",
        },
        innerBlocks: [],
      },
    ];
    const remoteBlockVersions = {
      "1": { version: 1, nonce: 1 },
      "2": { version: 1, nonce: 1 },
    };
    const remotePositionVersions = {
      "": { version: 2, nonce: 1 },
      "1": { version: 2, nonce: 1 },
    };

    const deletedBlocks = {};

    const { blocks, versions } = mergeBlocks(
      localBlocks,
      remoteBlocks,
      localBlockVersions,
      remoteBlockVersions,
      localPositionVersions,
      remotePositionVersions,
      deletedBlocks
    );

    expect(blocks).toEqual(remoteBlocks);
    expect(versions).toEqual(remoteBlockVersions);

    // Should be deterministic
    expect(blocks).toEqual(
      mergeBlocks(
        remoteBlocks,
        localBlocks,
        remoteBlockVersions,
        localBlockVersions,
        remotePositionVersions,
        localPositionVersions,
        deletedBlocks
      ).blocks
    );
  });
});
