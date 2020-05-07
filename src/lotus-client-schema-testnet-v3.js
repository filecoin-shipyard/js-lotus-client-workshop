const methods = {
  // Version func(context.Context) (api.Version, error)
  Version: {
    args: [],
    output: {
      name: 'version',
      primitiveType: 'object',
      complexType: 'Version'
    }
    // perm: 'write' // FIXME: Not really, just for testing http mode
  },

  ChainNotify: {
    args: [],
    subscription: true
  },

  StateListMiners: {},

  // Full Node

  // ChainHead(context.Context) (*types.TipSet, error)
  // head, err := api.ChainHead(ctx)
  ChainHead: {
    args: [],
    output: {
      name: 'headTipSet',
      primitiveType: 'object',
      complexType: 'TipSet'
    }
  },

  // ClientStartDeal   func(ctx context.Context, params *api.StartDealParams) (*cid.Cid, error)                             `perm:"admin"`
  /*
  {
    "jsonrpc": "2.0",
    "id": 2,
    "method": "Filecoin.ClientStartDeal",
    "params": [
      {
        "Data": {
          "TransferType": "graphsync",
          "Root": {
            "/": "bafkreifi255my6g5wket4fxgirz7zy2raocn7rytby6bucjl2aoeiqvy4y"
          },
          "PieceCid": null,
          "PieceSize": 0
        },
        "Wallet": "t3recoujjmhurgx6aki42e2fbtpomgs7rcr452bflztr434fc2q474wfy626um522k4hrmf25ns3qdvt3xguma",
        "Miner": "t01003",
        "EpochPrice": "500",
        "BlocksDuration": 100
      }
    ]
  }
  */

	// ClientStartDeal(ctx context.Context, params *StartDealParams) (*cid.Cid, error)

  ClientStartDeal: {}, // FIXME

	// ClientListDeals(ctx context.Context) ([]DealInfo, error)

  ClientListDeals: {}, // FIXME

  // ClientHasLocal(ctx context.Context, root cid.Cid) (bool, error)

  // {"jsonrpc":"2.0","id":1,"method":"Filecoin.ClientHasLocal",
  // "params":[{"/":"bafkreid4ll4qnj7rb6l2kfegtpg74m7lliilcmui3gmk2myckkrjxzshlq"}]}

  ClientHasLocal: {}, // FIXME

  // ClientFindData(ctx context.Context, root cid.Cid) ([]QueryOffer, error)

  // {"jsonrpc":"2.0","id":2,"method":"Filecoin.ClientFindData",
  // "params":[{"/":"bafkreid4ll4qnj7rb6l2kfegtpg74m7lliilcmui3gmk2myckkrjxzshlq"}]}

  ClientFindData: {}, // FIXME

	// ClientRetrieve(ctx context.Context, order RetrievalOrder, ref FileRef) error

  ClientRetrieve: {}, // FIXME

  // StateMinerPower         func(context.Context, address.Address, types.TipSetKey) (*api.MinerPower, error)                             `perm:"read"`
  // percI := types.BigDiv(types.BigMul(pow.MinerPower, types.NewInt(1000000)), pow.TotalPower)
  // fmt.Printf("Power: %s / %s (%0.4f%%)\n", types.SizeStr(pow.MinerPower), types.SizeStr(pow.TotalPower), float64(percI.Int64())/10000)
  StateMinerPower: {
    args: [
      {
        name: 'minerAddr',
        primitiveType: 'string',
        complexType: 'ActorAddress'
      },
      {
        name: 'tipSetKey',
        primitiveType: 'string',
        complexType: 'TipSetKey',
        default: ''
      }
    ],
    output: {
      name: 'minerPower',
      primitiveType: 'object',
      complexType: 'MinerPower'
    }
  },

  // StateMinerPostState(ctx context.Context, actor address.Address, tsk types.TipSetKey) (*miner.PoStState, error)
  // ps, err := api.StateMinerPostState(ctx, maddr, types.EmptyTSK)
  StateMinerPostState: {
    args: [
      {
        name: 'minerAddr',
        primitiveType: 'string',
        complexType: 'ActorAddress'
      },
      {
        name: 'tipSetKey',
        primitiveType: 'string',
        complexType: 'TipSetKey',
        default: ''
      }
    ],
    output: {
      name: 'minerPoStState',
      primitiveType: 'object',
      complexType: 'MinerPoStState'
    }
  },

  // StateMinerSectorSize    func(context.Context, address.Address, types.TipSetKey) (abi.SectorSize, error)                              `perm:"read"`
  // sizeByte, err := api.StateMinerSectorSize(ctx, maddr, types.EmptyTSK)
  // fmt.Printf("Sector Size: %s\n", types.SizeStr(types.NewInt(uint64(sizeByte))))
  StateMinerSectorSize: {
    args: [
      {
        name: 'minerAddr',
        primitiveType: 'string',
        complexType: 'ActorAddress'
      },
      {
        name: 'tipSetKey',
        primitiveType: 'string',
        complexType: 'TipSetKey',
        default: ''
      }
    ],
    output: {
      name: 'bytes',
      primitiveType: 'number',
      complexType: 'SectorSize'
    }
  },

  // StateMinerFaults(context.Context, address.Address, types.TipSetKey) ([]abi.SectorNumber, error)
  // faults, err := api.StateMinerFaults(ctx, maddr, types.EmptyTSK)
  StateMinerFaults: {
    args: [
      {
        name: 'minerAddr',
        primitiveType: 'string',
        complexType: 'ActorAddress'
      },
      {
        name: 'tipSetKey',
        primitiveType: 'string',
        complexType: 'TipSetKey',
        default: ''
      }
    ],
    output: {
      name: 'sectorNumbers',
      primitiveType: '[number]',
      complexType: '[SectorNumber]'
    }
  },

  // StateMinerSectorCount(context.Context, address.Address, types.TipSetKey) (MinerSectors, error)
  // secCounts, err := api.StateMinerSectorCount(ctx, maddr, types.EmptyTSK)
  StateMinerSectorCount: {
    args: [
      {
        name: 'minerSectorCount',
        primitiveType: 'string',
        complexType: 'ActorAddress'
      },
      {
        name: 'tipSetKey',
        primitiveType: 'string',
        complexType: 'TipSetKey',
        default: ''
      }
    ],
    output: {
      name: 'minerSectors',
      primitiveType: 'object',
      complexType: 'MinerSectors'
    }
  },

  // StateMarketBalance       func(context.Context, address.Address, types.TipSetKey) (api.MarketBalance, error)                                  `perm:"read"`
  StateMarketBalance: {
    args: [
      {
        name: 'address',
        primitiveType: 'string',
        complexType: 'Address'
      },
      {
        name: 'tipSetKey',
        primitiveType: 'string',
        complexType: 'TipSetKey',
        default: ''
      }
    ]
  },

  // StateMarketStorageDeal(context.Context, abi.DealID, types.TipSetKey) (*MarketDeal, error)
  StateMarketStorageDeal: {}, // FIXME

  // WalletBalance        func(context.Context, address.Address) (types.BigInt, error)                         `perm:"read"`
  // balance, err := api.WalletBalance(ctx, addr)
  WalletBalance: {
    args: [
      {
        name: 'walletAddress',
        primitiveType: 'string',
        complexType: 'WalletAddress'
      }
    ],
    output: {
      primitiveType: 'string',
      complexType: 'BigInt'
    }
  },

  // WalletDefaultAddress func(context.Context) (address.Address, error)                                       `perm:"write"`
  // addr, err = api.WalletDefaultAddress(ctx)
  WalletDefaultAddress: {
    args: [],
    output: {
      primitiveType: 'string',
      complexType: 'ActorAddress'
    }
  },

  // Storage Miner

  // ActorAddress    func(context.Context) (address.Address, error)                 `perm:"read"`
  // maddr, err := nodeApi.ActorAddress(ctx)
  ActorAddress: {
    args: [],
    output: {
      primitiveType: 'string',
      complexType: 'ActorAddress'
    }
  },

  // Storage Miner low-level api_storage.go

  // Temp api for testing
  // PledgeSector(context.Context) error
  // return nodeApi.PledgeSector(ctx)
  PledgeSector: {
    args: [],
    output: {},
    perm: 'write'
  },

  // List all staged sectors
  // SectorsList(context.Context) ([]abi.SectorNumber, error)
  // sectors, err := napi.SectorsList(ctx)
  SectorsList: {
    args: [],
    output: {
      name: 'sectorNumbers',
      primitiveType: '[number]',
      complexType: '[SectorNumber]'
    }
  },

  // Get the status of a given sector by ID
  // SectorsStatus(context.Context, abi.SectorNumber) (SectorInfo, error)
  // st, err := napi.SectorsStatus(ctx, s)
  // out[api.SectorStates[st.State]]++
  SectorsStatus: {
    args: [
      {
        name: 'sectorNumber',
        primitiveType: 'number',
        complexType: 'SectorNumber'
      }
    ],
    output: {
      name: 'sectorInfo',
      primitiveType: 'object',
      complexType: 'SectorInfo'
    }
  }
}

// Complex Types

/*
type MinerPower struct {
  MinerPower types.BigInt
  TotalPower types.BigInt
}
*/

/*
type MinerSectors struct {
  Pset uint64
  Sset uint64
}
*/

/*
type SectorNumber uint64

func (s SectorNumber) String() string {
  return strconv.FormatUint(uint64(s), 10)
}
*/

/*
/type PoStState struct {
  // Epoch that starts the current proving period
  ProvingPeriodStart abi.ChainEpoch

  // Number of surprised post challenges that have been failed since last successful PoSt.
  // Indicates that the claimed storage power may not actually be proven. Recovery can proceed by
  // submitting a correct response to a subsequent PoSt challenge, up until
  // the limit of number of consecutive failures.
  NumConsecutiveFailures int64
}

type ChainEpoch int64

func (e ChainEpoch) String() string {
  return strconv.FormatInt(int64(e), 10)
}
*/

/*
type TipSet struct {
  cids   []cid.Cid
  blks   []*BlockHeader
  height abi.ChainEpoch
}
*/

/*

const (
  UndefinedSectorState SectorState = iota  0

  // happy path
  Empty 1
  Packing 2 // sector not in sealStore, and not on chain

  Unsealed 3      // sealing / queued
  PreCommitting 4 // on chain pre-commit
  WaitSeed 5      // waiting for seed
  Committing 6
  CommitWait 7 // waiting for message to land on chain
  FinalizeSector 8
  Proving 9
  _ 10 // reserved
  _ 11
  _ 12

  // recovery handling
  // Reseal
  _ 13
  _ 14
  _ 15
  _ 16
  _ 17
  _ 18
  _ 19

  // error modes
  FailedUnrecoverable 20

  SealFailed 21
  PreCommitFailed 22
  SealCommitFailed 23
  CommitFailed 24
  PackingFailed 25
  _ 26
  _ 27
  _ 28

  Faulty 29        // sector is corrupted or gone for some reason
  FaultReported 30 // sector has been declared as a fault on chain
  FaultedFinal 31  // fault declared on chain
)

type SectorInfo struct {
  SectorID abi.SectorNumber
  State    SectorState
  CommD    *cid.Cid
  CommR    *cid.Cid
  Proof    []byte
  Deals    []abi.DealID
  Ticket   SealTicket
  Seed     SealSeed
  Retries  uint64

  LastErr string

  Log []SectorLog
}

var SectorStates = []string{
  UndefinedSectorState: "UndefinedSectorState",
  Empty:                "Empty",
  Packing:              "Packing",
  Unsealed:             "Unsealed",
  PreCommitting:        "PreCommitting",
  WaitSeed:             "WaitSeed",
  Committing:           "Committing",
  CommitWait:           "CommitWait",
  FinalizeSector:       "FinalizeSector",
  Proving:              "Proving",

  SealFailed:       "SealFailed",
  PreCommitFailed:  "PreCommitFailed",
  SealCommitFailed: "SealCommitFailed",
  CommitFailed:     "CommitFailed",
  PackingFailed:    "PackingFailed",

  FailedUnrecoverable: "FailedUnrecoverable",

  Faulty:        "Faulty",
  FaultReported: "FaultReported",
  FaultedFinal:  "FaultedFinal",
}
*/

/*
// Version provides various build-time information
type Version struct {
  Version string

  // APIVersion is a binary encoded semver version of the remote implementing
  // this api
  //
  // See APIVersion in build/version.go
  APIVersion build.Version

  // TODO: git commit / os / genesis cid?

  // Seconds
  BlockDelay uint64
}
*/

const schema = {
  methods
}

export default schema
