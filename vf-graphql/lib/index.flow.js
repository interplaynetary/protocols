// @flow

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {|
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  /**
   * The `DateTime` scalar type represents a DateTime value as specified by
   * [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: Date,
  /**
   * The `Decimal` scalar type represents arbitrary-precision floating-point
   * numbers as specified by
   * [IEEE 854-1987](https://en.wikipedia.org/wiki/IEEE_854-1987).  They
   * are represented as strings.
   */
  Decimal: any,
  /** The `URI` type simply declares a reference to an external web URL, Holochain entry or other resource. */
  URI: string,
  /** Filtering module stub */
  _vf_filtering_dummy: any,
|};

/** A boundary or context grouped around some other record- used for documenting, accounting, planning. */
export type AccountingScope = Organization | Person;

/**
 * An action verb defining the kind of event, commitment, or intent.
 * It is recommended that the lowercase action verb should be used as the record ID
 * in order that references to `Action`s elsewhere in the system are easily readable.
 */
export type Action = {|
  __typename?: 'Action',
  id: $ElementType<Scalars, 'ID'>,
  /** Denotes if a process input or output, or not related to a process. */
  inputOutput?: ?$ElementType<Scalars, 'String'>,
  /** A unique verb which defines the action. */
  label: $ElementType<Scalars, 'String'>,
  /** The onhand effect of an economic event on a resource, increment, decrement, no effect, or decrement resource and increment 'to' resource. */
  onhandEffect: $ElementType<Scalars, 'String'>,
  /** The action that should be included on the other direction of the process, for example accept with modify. */
  pairsWith?: ?$ElementType<Scalars, 'String'>,
  /** The accounting effect of an economic event on a resource, increment, decrement, no effect, or decrement resource and increment 'to' resource. */
  resourceEffect: $ElementType<Scalars, 'String'>,
|};

/** A person or group or organization with economic agency. */
export type Agent = {|
  claims?: ?IntentConnection,
  claimsAsProvider?: ?IntentConnection,
  claimsAsReceiver?: ?IntentConnection,
  claimsInScope?: ?IntentConnection,
  commitments?: ?CommitmentConnection,
  commitmentsAsProvider?: ?CommitmentConnection,
  commitmentsAsReceiver?: ?CommitmentConnection,
  commitmentsInScope?: ?CommitmentConnection,
  economicEvents?: ?EconomicEventConnection,
  economicEventsAsProvider?: ?EconomicEventConnection,
  economicEventsAsReceiver?: ?EconomicEventConnection,
  economicEventsInScope?: ?EconomicEventConnection,
  id: $ElementType<Scalars, 'ID'>,
  /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
  intents?: ?IntentConnection,
  intentsAsProvider?: ?IntentConnection,
  intentsAsReceiver?: ?IntentConnection,
  intentsInScope?: ?IntentConnection,
  inventoriedEconomicResources?: ?EconomicResourceConnection,
  meta: RecordMeta,
  /** An informal or formal textual identifier for an agent. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  plans?: ?PlanConnection,
  /** The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: ?SpatialThing,
  processes?: ?ProcessConnection,
  proposals?: ?ProposalConnection,
  proposalsInScope?: ?ProposalConnection,
  proposalsTo?: ?ProposalConnection,
  relationships?: ?AgentRelationshipConnection,
  relationshipsAsObject?: ?AgentRelationshipConnection,
  relationshipsAsSubject?: ?AgentRelationshipConnection,
  revision?: ?Agent,
  revisionId: $ElementType<Scalars, 'ID'>,
  roles?: ?Array<AgentRelationshipRole>,
  scenariosInScope?: ?ScenarioConnection,
|};


/** A person or group or organization with economic agency. */
export type AgentClaimsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentClaimsAsProviderArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentClaimsAsReceiverArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentClaimsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentCommitmentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentCommitmentFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentCommitmentsAsProviderArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentCommitmentsAsReceiverArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentCommitmentsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentEconomicEventsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentEventFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentEconomicEventsAsProviderArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentEconomicEventsAsReceiverArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentEconomicEventsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentIntentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentIntentFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentIntentsAsProviderArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentIntentsAsReceiverArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentIntentsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentInventoriedEconomicResourcesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentResourceFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentPlansArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentPlanFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentProcessesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentProcessFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentProposalsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentProposalSearchParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentProposalsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentProposalsToArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentRelationshipsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentRelationshipFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentRelationshipsAsObjectArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentRelationshipFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentRelationshipsAsSubjectArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentRelationshipFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A person or group or organization with economic agency. */
export type AgentRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** A person or group or organization with economic agency. */
export type AgentScenariosInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};

/** Query parameters for reading `Commitment`s related to an `Agent` */
export type AgentCommitmentFilterParams = {|
  action?: ?$ElementType<Scalars, 'ID'>,
  endDate?: ?$ElementType<Scalars, 'DateTime'>,
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  searchString?: ?$ElementType<Scalars, 'String'>,
  startDate?: ?$ElementType<Scalars, 'DateTime'>,
|};

export type AgentConnection = {|
  __typename?: 'AgentConnection',
  edges: Array<AgentEdge>,
  pageInfo: PageInfo,
|};

export type AgentCreateParams = {|
  /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** An informal or formal textual identifier for an agent. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`SpatialThing`) The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: ?$ElementType<Scalars, 'ID'>,
|};

export type AgentEdge = {|
  __typename?: 'AgentEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Agent,
|};

/** Query parameters for reading `EconomicEvent`s related to an `Agent` */
export type AgentEventFilterParams = {|
  action?: ?$ElementType<Scalars, 'ID'>,
  endDate?: ?$ElementType<Scalars, 'DateTime'>,
  searchString?: ?$ElementType<Scalars, 'String'>,
  startDate?: ?$ElementType<Scalars, 'DateTime'>,
|};

export type AgentFilterParams = {|
  /** Retrieve only agents with the specified classification(s). */
  classifiedAs?: ?Array<$ElementType<Scalars, 'ID'>>,
|};

/** Query parameters for reading `Intent`s related to an `Agent` */
export type AgentIntentFilterParams = {|
  action?: ?$ElementType<Scalars, 'ID'>,
  endDate?: ?$ElementType<Scalars, 'DateTime'>,
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  searchString?: ?$ElementType<Scalars, 'String'>,
  startDate?: ?$ElementType<Scalars, 'DateTime'>,
|};

/** Query parameters for reading `Plan`s related to an `Agent` */
export type AgentPlanFilterParams = {|
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  searchString?: ?$ElementType<Scalars, 'String'>,
|};

/** Query parameters for reading `Process`es related to an `Agent` */
export type AgentProcessFilterParams = {|
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  searchString?: ?$ElementType<Scalars, 'String'>,
|};

/** The role of an economic relationship that exists between 2 agents, such as member, trading partner. */
export type AgentRelationship = {|
  __typename?: 'AgentRelationship',
  id: $ElementType<Scalars, 'ID'>,
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<AccountingScope>,
  meta: RecordMeta,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The object of a relationship between 2 agents.  For example, if Mary is a member of a group, then the group is the object. */
  object: Agent,
  /** A kind of relationship that exists between 2 agents. */
  relationship: AgentRelationshipRole,
  revision?: ?AgentRelationship,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** The subject of a relationship between 2 agents.  For example, if Mary is a member of a group, then Mary is the subject. */
  subject: Agent,
|};


/** The role of an economic relationship that exists between 2 agents, such as member, trading partner. */
export type AgentRelationshipRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type AgentRelationshipConnection = {|
  __typename?: 'AgentRelationshipConnection',
  edges: Array<AgentRelationshipEdge>,
  pageInfo: PageInfo,
|};

export type AgentRelationshipCreateParams = {|
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Agent`) The object of a relationship between 2 agents.  For example, if Mary is a member of a group, then the group is the object. */
  object: $ElementType<Scalars, 'ID'>,
  /** (`AgentRelationshipRole`) The role of an economic relationship that exists between 2 agents, such as member, trading partner. */
  relationship: $ElementType<Scalars, 'ID'>,
  /** (`Agent`) The subject of a relationship between 2 agents.  For example, if Mary is a member of a group, then Mary is the subject. */
  subject: $ElementType<Scalars, 'ID'>,
|};

export type AgentRelationshipEdge = {|
  __typename?: 'AgentRelationshipEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: AgentRelationship,
|};

export type AgentRelationshipFilterParams = {|
  /** Retrieve only relationships relevant in the given accounting scope(s). */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** Retrieve only relationships matching these AgentRelationshipRole(s). */
  roleId?: ?Array<$ElementType<Scalars, 'ID'>>,
|};

export type AgentRelationshipResponse = {|
  __typename?: 'AgentRelationshipResponse',
  agentRelationship: AgentRelationship,
|};

/** A relationship role defining the kind of association one agent can have with another. */
export type AgentRelationshipRole = {|
  __typename?: 'AgentRelationshipRole',
  agentRelationships?: ?AgentRelationshipConnection,
  id: $ElementType<Scalars, 'ID'>,
  /** The human readable name of the role, from the object to the subject. */
  inverseRoleLabel?: ?$ElementType<Scalars, 'String'>,
  meta: RecordMeta,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revision?: ?AgentRelationshipRole,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** The human readable name of the role, from the subject to the object. */
  roleLabel: $ElementType<Scalars, 'String'>,
|};


/** A relationship role defining the kind of association one agent can have with another. */
export type AgentRelationshipRoleAgentRelationshipsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A relationship role defining the kind of association one agent can have with another. */
export type AgentRelationshipRoleRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type AgentRelationshipRoleConnection = {|
  __typename?: 'AgentRelationshipRoleConnection',
  edges: Array<AgentRelationshipRoleEdge>,
  pageInfo: PageInfo,
|};

export type AgentRelationshipRoleCreateParams = {|
  /** The human readable name of the role, inverse from the object to the subject. For example, 'has member'. */
  inverseRoleLabel?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The human readable name of the role, inverse from the object to the subject. For example, 'is member of'. */
  roleLabel: $ElementType<Scalars, 'String'>,
|};

export type AgentRelationshipRoleEdge = {|
  __typename?: 'AgentRelationshipRoleEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: AgentRelationshipRole,
|};

export type AgentRelationshipRoleResponse = {|
  __typename?: 'AgentRelationshipRoleResponse',
  agentRelationshipRole?: ?AgentRelationshipRole,
|};

export type AgentRelationshipRoleUpdateParams = {|
  /** The human readable name of the role, inverse from the object to the subject. For example, 'has member'. */
  inverseRoleLabel?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** The human readable name of the role, inverse from the object to the subject. For example, 'is member of'. */
  roleLabel?: ?$ElementType<Scalars, 'String'>,
|};

export type AgentRelationshipUpdateParams = {|
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Agent`) The object of a relationship between 2 agents.  For example, if Mary is a member of a group, then the group is the object. */
  object?: ?$ElementType<Scalars, 'ID'>,
  /** (`AgentRelationshipRole`) The role of an economic relationship that exists between 2 agents, such as member, trading partner. */
  relationship?: ?$ElementType<Scalars, 'ID'>,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** (`Agent`) The subject of a relationship between 2 agents.  For example, if Mary is a member of a group, then Mary is the subject. */
  subject?: ?$ElementType<Scalars, 'ID'>,
|};

/** Query parameters for reading `EconomicResource`s related to an `Agent` */
export type AgentResourceFilterParams = {|
  page?: ?$ElementType<Scalars, 'Int'>,
  resourceClassification?: ?$ElementType<Scalars, 'URI'>,
  searchString?: ?$ElementType<Scalars, 'String'>,
|};

export type AgentUpdateParams = {|
  /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** An informal or formal textual identifier for an agent. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`SpatialThing`) The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: ?$ElementType<Scalars, 'ID'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

/** Any type of agreement among economic agents. */
export type Agreement = {|
  __typename?: 'Agreement',
  commitments?: ?Array<Commitment>,
  /** The date and time the agreement was created. */
  created?: ?$ElementType<Scalars, 'DateTime'>,
  economicEvents?: ?Array<EconomicEvent>,
  id: $ElementType<Scalars, 'ID'>,
  involvedAgents?: ?AgentConnection,
  meta: RecordMeta,
  /** An informal or formal textual identifier for an agreement. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revision?: ?Agreement,
  revisionId: $ElementType<Scalars, 'ID'>,
  unplannedEconomicEvents?: ?Array<EconomicEvent>,
|};


/** Any type of agreement among economic agents. */
export type AgreementInvolvedAgentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** Any type of agreement among economic agents. */
export type AgreementRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type AgreementConnection = {|
  __typename?: 'AgreementConnection',
  edges: Array<AgreementEdge>,
  pageInfo: PageInfo,
|};

export type AgreementCreateParams = {|
  /** The date and time the agreement was created. */
  created?: ?$ElementType<Scalars, 'DateTime'>,
  /** An informal or formal textual identifier for an agreement. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
|};

export type AgreementEdge = {|
  __typename?: 'AgreementEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Agreement,
|};

export type AgreementResponse = {|
  __typename?: 'AgreementResponse',
  agreement: Agreement,
|};

export type AgreementUpdateParams = {|
  /** The date and time the agreement was created. */
  created?: ?$ElementType<Scalars, 'DateTime'>,
  /** An informal or formal textual identifier for an agreement. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

/**
 * A way to tie an economic event that is given in loose fulfilment for another economic event, without commitments or expectations.
 * Supports the gift economy.
 */
export type Appreciation = {|
  __typename?: 'Appreciation',
  /** The agent who is appreciating. */
  appreciatedBy?: ?Agent,
  /** The economic event this appreciation has been given in acknowledgement of. */
  appreciationOf: EconomicEvent,
  /** The economic event provided as a gift in this appreciation. */
  appreciationWith: EconomicEvent,
  id: $ElementType<Scalars, 'ID'>,
  meta: RecordMeta,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revision?: ?Appreciation,
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/**
 * A way to tie an economic event that is given in loose fulfilment for another economic event, without commitments or expectations.
 * Supports the gift economy.
 */
export type AppreciationRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type AppreciationConnection = {|
  __typename?: 'AppreciationConnection',
  edges: Array<AppreciationEdge>,
  pageInfo: PageInfo,
|};

export type AppreciationCreateParams = {|
  /** (`Agent`) The agent who is appreciating. */
  appreciatedBy?: ?$ElementType<Scalars, 'ID'>,
  /** (`EconomicEvent`) The economic event this appreciation has been given in acknowledgement of. */
  appreciationOf: $ElementType<Scalars, 'ID'>,
  /** (`EconomicEvent`) The economic event provided as a gift in this appreciation. */
  appreciationWith: $ElementType<Scalars, 'ID'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
|};

export type AppreciationEdge = {|
  __typename?: 'AppreciationEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Appreciation,
|};

export type AppreciationResponse = {|
  __typename?: 'AppreciationResponse',
  appreciation: Appreciation,
|};

export type AppreciationUpdateParams = {|
  /** (`EconomicEvent`) The economic event this appreciation has been given in acknowledgement of. */
  appreciationOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`EconomicEvent`) The economic event provided as a gift in this appreciation. */
  appreciationWith?: ?$ElementType<Scalars, 'ID'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

/** A claim for a future economic event(s) in reciprocity for an economic event that already occurred. For example, a claim for payment for goods received. */
export type Claim = {|
  __typename?: 'Claim',
  /** Relates a claim to a verb, such as consume, produce, work, improve, etc. */
  action: Action,
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this claim. */
  agreedIn?: ?$ElementType<Scalars, 'URI'>,
  /** The data on which the claim was made. */
  created?: ?$ElementType<Scalars, 'DateTime'>,
  /** The time the claim is expected to be settled. */
  due?: ?$ElementType<Scalars, 'DateTime'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?Measure,
  /** The claim is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  id: $ElementType<Scalars, 'ID'>,
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<AccountingScope>,
  meta: RecordMeta,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The economic agent from whom the claim is expected. */
  provider?: ?Agent,
  /** The economic agent whom the claim is for. */
  receiver?: ?Agent,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: ?ResourceSpecification,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?Measure,
  revision?: ?Claim,
  revisionId: $ElementType<Scalars, 'ID'>,
  settledBy?: ?SettlementConnection,
  /** The economic event which already occurred which this claim has been made against. */
  triggeredBy: EconomicEvent,
|};


/** A claim for a future economic event(s) in reciprocity for an economic event that already occurred. For example, a claim for payment for goods received. */
export type ClaimRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** A claim for a future economic event(s) in reciprocity for an economic event that already occurred. For example, a claim for payment for goods received. */
export type ClaimSettledByArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};

export type ClaimConnection = {|
  __typename?: 'ClaimConnection',
  edges: Array<ClaimEdge>,
  pageInfo: PageInfo,
|};

export type ClaimCreateParams = {|
  /** (`Action`) Relates a claim to a verb, such as consume, produce, work, improve, etc. */
  action: $ElementType<Scalars, 'ID'>,
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this claim. */
  agreedIn?: ?$ElementType<Scalars, 'URI'>,
  /** The data on which the claim was made. */
  created?: ?$ElementType<Scalars, 'DateTime'>,
  /** The time the claim is expected to be settled. */
  due?: ?$ElementType<Scalars, 'DateTime'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** The claim is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Agent`) The economic agent from whom the claim is expected. */
  provider?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agent`) The economic agent whom the claim is for. */
  receiver?: ?$ElementType<Scalars, 'ID'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: ?$ElementType<Scalars, 'ID'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?IMeasure,
  /** (`EconomicEvent`) The economic event which already occurred which this claim has been made against. */
  triggeredBy: $ElementType<Scalars, 'ID'>,
|};

export type ClaimEdge = {|
  __typename?: 'ClaimEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Claim,
|};

export type ClaimFilterParams = {|
  action?: ?Array<$ElementType<Scalars, 'ID'>>,
  endDate?: ?$ElementType<Scalars, 'DateTime'>,
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  providerId?: ?Array<$ElementType<Scalars, 'ID'>>,
  receiverId?: ?Array<$ElementType<Scalars, 'ID'>>,
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  resourceConformsTo?: ?Array<$ElementType<Scalars, 'ID'>>,
  startDate?: ?$ElementType<Scalars, 'DateTime'>,
|};

export type ClaimResponse = {|
  __typename?: 'ClaimResponse',
  claim: Claim,
|};

export type ClaimUpdateParams = {|
  /** (`Action`) Relates a claim to a verb, such as consume, produce, work, improve, etc. */
  action?: ?$ElementType<Scalars, 'ID'>,
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this claim. */
  agreedIn?: ?$ElementType<Scalars, 'URI'>,
  /** The data on which the claim was made. */
  created?: ?$ElementType<Scalars, 'DateTime'>,
  /** The time the claim is expected to be settled. */
  due?: ?$ElementType<Scalars, 'DateTime'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** The claim is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Agent`) The economic agent from whom the claim is expected. */
  provider?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agent`) The economic agent whom the claim is for. */
  receiver?: ?$ElementType<Scalars, 'ID'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: ?$ElementType<Scalars, 'ID'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?IMeasure,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** (`EconomicEvent`) The economic event which already occurred which this claim has been made against. */
  triggeredBy?: ?$ElementType<Scalars, 'ID'>,
|};

/** A planned economic flow that has been promised by an agent to another agent. */
export type Commitment = {|
  __typename?: 'Commitment',
  /** Relates a commitment to a verb, such as consume, produce, work, improve, etc. */
  action: Action,
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this commitment. */
  agreedIn?: ?$ElementType<Scalars, 'URI'>,
  /** The place where a commitment occurs. Usually mappable. */
  atLocation?: ?SpatialThing,
  /** This commitment is part of the exchange agreement. */
  clauseOf?: ?Agreement,
  /** The creation time of the commitment. */
  created?: ?$ElementType<Scalars, 'DateTime'>,
  /** The commitment can be safely deleted, has no dependent information. */
  deletable?: ?$ElementType<Scalars, 'Boolean'>,
  /** The time something is expected to be complete. */
  due?: ?$ElementType<Scalars, 'DateTime'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?Measure,
  /** The commitment is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  /** The economic event which completely or partially fulfills a commitment. */
  fulfilledBy?: ?Array<Fulfillment>,
  /** The planned beginning of the commitment. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned end of the commitment. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned date/time for the commitment. Can be used instead of beginning and end. */
  hasPointInTime?: ?$ElementType<Scalars, 'DateTime'>,
  id: $ElementType<Scalars, 'ID'>,
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<AccountingScope>,
  /** Represents a desired deliverable expected from this plan. */
  independentDemandOf?: ?Plan,
  /** Defines the process to which this commitment is an input. */
  inputOf?: ?Process,
  involvedAgents?: ?Array<Agent>,
  meta: RecordMeta,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** Defines the process for which this commitment is an output. */
  outputOf?: ?Process,
  /** The transfer commitment is part of the plan. */
  plannedWithin?: ?Plan,
  /** The economic agent from whom the commitment is initiated. */
  provider: Agent,
  /** The economic agent whom the commitment is for. */
  receiver: Agent,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: ?ResourceSpecification,
  /** Economic resource involved in the commitment. */
  resourceInventoriedAs?: ?EconomicResource,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?Measure,
  revision?: ?Commitment,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** An intent satisfied fully or partially by an economic event or commitment. */
  satisfies?: ?Array<Satisfaction>,
  /** References the ProcessSpecification of the last process the economic resource went through. Stage is used when the last process is important for finding proper resources, such as where the publishing process wants only documents that have gone through the editing process. */
  stage?: ?ProcessSpecification,
  /** Additional economic resource on the commitment when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side. */
  toResourceInventoriedAs?: ?EconomicResource,
|};


/** A planned economic flow that has been promised by an agent to another agent. */
export type CommitmentRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type CommitmentConnection = {|
  __typename?: 'CommitmentConnection',
  edges: Array<CommitmentEdge>,
  pageInfo: PageInfo,
|};

export type CommitmentCreateParams = {|
  /** (`Action`) Relates a commitment to a verb, such as consume, produce, work, improve, etc. */
  action: $ElementType<Scalars, 'ID'>,
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this commitment. */
  agreedIn?: ?$ElementType<Scalars, 'URI'>,
  /** (`SpatialThing`) The place where an commitment occurs.  Usually mappable. */
  atLocation?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agreement`) This commitment is part of the agreement. */
  clauseOf?: ?$ElementType<Scalars, 'ID'>,
  /** The time something is expected to be complete. */
  due?: ?$ElementType<Scalars, 'DateTime'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** The commitment is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  /** The planned beginning of the commitment. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned end of the commitment. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned date/time for the commitment. Can be used instead of beginning and end. */
  hasPointInTime?: ?$ElementType<Scalars, 'DateTime'>,
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** (`Plan`) Represents a desired deliverable expected from this plan. */
  independentDemandOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`Process`) Defines the process to which this commitment is an input. */
  inputOf?: ?$ElementType<Scalars, 'ID'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Process`) Defines the process for which this commitment is an output. */
  outputOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`Plan`) The transfer commitment is part of the plan. */
  plannedWithin?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agent`) The economic agent from whom the commitment is initiated. */
  provider: $ElementType<Scalars, 'ID'>,
  /** (`Agent`) The economic agent whom the commitment is for. */
  receiver: $ElementType<Scalars, 'ID'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: ?$ElementType<Scalars, 'ID'>,
  /** (`EconomicResource`) Economic resource involved in the commitment. */
  resourceInventoriedAs?: ?$ElementType<Scalars, 'ID'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?IMeasure,
  /** The process stage of the commitment. */
  stage?: ?$ElementType<Scalars, 'URI'>,
  /** (`EconomicResource`) Additional economic resource on the commitment when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side. */
  toResourceInventoriedAs?: ?$ElementType<Scalars, 'ID'>,
|};

export type CommitmentEdge = {|
  __typename?: 'CommitmentEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Commitment,
|};

export type CommitmentFilterParams = {|
  action?: ?Array<$ElementType<Scalars, 'ID'>>,
  endDate?: ?$ElementType<Scalars, 'DateTime'>,
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  providerId?: ?Array<$ElementType<Scalars, 'ID'>>,
  receiverId?: ?Array<$ElementType<Scalars, 'ID'>>,
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  resourceConformsTo?: ?Array<$ElementType<Scalars, 'ID'>>,
  searchString?: ?$ElementType<Scalars, 'String'>,
  startDate?: ?$ElementType<Scalars, 'DateTime'>,
|};

export type CommitmentResponse = {|
  __typename?: 'CommitmentResponse',
  commitment: Commitment,
|};

export type CommitmentUpdateParams = {|
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this commitment. */
  agreedIn?: ?$ElementType<Scalars, 'URI'>,
  /** (`SpatialThing`) The place where an commitment occurs.  Usually mappable. */
  atLocation?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agreement`) This commitment is part of the agreement. */
  clauseOf?: ?$ElementType<Scalars, 'ID'>,
  /** The time something is expected to be complete. */
  due?: ?$ElementType<Scalars, 'DateTime'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** The commitment is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  /** The planned beginning of the commitment. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned end of the commitment. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned date/time for the commitment. Can be used instead of beginning and end. */
  hasPointInTime?: ?$ElementType<Scalars, 'DateTime'>,
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** (`Plan`) Represents a desired deliverable expected from this plan. */
  independentDemandOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`Process`) Defines the process to which this commitment is an input. */
  inputOf?: ?$ElementType<Scalars, 'ID'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Process`) Defines the process for which this commitment is an output. */
  outputOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`Plan`) The transfer commitment is part of the plan. */
  plannedWithin?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agent`) The economic agent from whom the commitment is initiated. */
  provider?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agent`) The economic agent whom the commitment is for. */
  receiver?: ?$ElementType<Scalars, 'ID'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: ?$ElementType<Scalars, 'ID'>,
  /** (`EconomicResource`) Economic resource involved in the commitment. */
  resourceInventoriedAs?: ?$ElementType<Scalars, 'ID'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?IMeasure,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** The process stage of the commitment. */
  stage?: ?$ElementType<Scalars, 'URI'>,
  /** (`EconomicResource`) Additional economic resource on the commitment when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side. */
  toResourceInventoriedAs?: ?$ElementType<Scalars, 'ID'>,
|};



/** A `Duration` represents an interval between two `DateTime` values. */
export type Duration = {|
  __typename?: 'Duration',
  /** A number representing the duration, will be paired with a unit. */
  numericDuration: $ElementType<Scalars, 'Decimal'>,
  /** A unit of measure. */
  unitType: TimeUnit,
|};

/** An observed economic flow, as opposed to a flow planned to happen in the future. This could reflect a change in the quantity of an economic resource. It is also defined by its behavior in relation to the economic resource (see `Action`) */
export type EconomicEvent = {|
  __typename?: 'EconomicEvent',
  /** Relates an economic event to a verb, such as consume, produce, work, improve, etc. */
  action: Action,
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this economic event. */
  agreedIn?: ?$ElementType<Scalars, 'URI'>,
  appreciationOf?: ?Array<Appreciation>,
  appreciationWith?: ?Array<Appreciation>,
  /** The place where an economic event occurs.  Usually mappable. */
  atLocation?: ?SpatialThing,
  /** The economic event can be safely deleted, has no dependent information. */
  deletable?: ?$ElementType<Scalars, 'Boolean'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?Measure,
  fulfills?: ?Array<Fulfillment>,
  /** The beginning of the economic event. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The end of the economic event. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** The date/time at which the economic event occurred. Can be used instead of beginning and end. */
  hasPointInTime?: ?$ElementType<Scalars, 'DateTime'>,
  id: $ElementType<Scalars, 'ID'>,
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<AccountingScope>,
  /** Defines the process to which this event is an input. */
  inputOf?: ?Process,
  meta: RecordMeta,
  next?: ?Array<ProductionFlowItem>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** Defines the process for which this event is an output. */
  outputOf?: ?Process,
  previous?: ?Array<ProductionFlowItem>,
  /** The economic agent from whom the actual economic event is initiated. */
  provider: Agent,
  /** This economic event occurs as part of this agreement. */
  realizationOf?: ?Agreement,
  /** The economic agent whom the actual economic event is for. */
  receiver: Agent,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: ?ResourceSpecification,
  /** Economic resource involved in the economic event. */
  resourceInventoriedAs?: ?EconomicResource,
  /** The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action. */
  resourceQuantity?: ?Measure,
  revision?: ?EconomicEvent,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** An intent satisfied fully or partially by an economic event or commitment. */
  satisfies?: ?Array<Satisfaction>,
  settles?: ?Array<Settlement>,
  /** The new location of the receiver resource. */
  toLocation?: ?SpatialThing,
  /** Additional economic resource on the economic event when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side. */
  toResourceInventoriedAs?: ?EconomicResource,
  trace?: ?Array<TrackTraceItem>,
  track?: ?Array<TrackTraceItem>,
  /** References another economic event that implied this economic event, often based on a prior agreement. */
  triggeredBy?: ?EconomicEvent,
  /** Other EconomicEvents which have been triggered by this one. */
  triggers?: ?Array<EconomicEvent>,
|};


/** An observed economic flow, as opposed to a flow planned to happen in the future. This could reflect a change in the quantity of an economic resource. It is also defined by its behavior in relation to the economic resource (see `Action`) */
export type EconomicEventRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type EconomicEventConnection = {|
  __typename?: 'EconomicEventConnection',
  edges: Array<EconomicEventEdge>,
  pageInfo: PageInfo,
|};

export type EconomicEventCreateParams = {|
  /** (`Action`) Relates an economic event to a verb, such as consume, produce, work, improve, etc. */
  action: $ElementType<Scalars, 'ID'>,
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this economic event. */
  agreedIn?: ?$ElementType<Scalars, 'URI'>,
  /** (`SpatialThing`) The place where an economic event occurs.  Usually mappable. */
  atLocation?: ?$ElementType<Scalars, 'ID'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** The beginning of the economic event. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The end of the economic event. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** The date/time at which the economic event occurred. Can be used instead of beginning and end. */
  hasPointInTime?: ?$ElementType<Scalars, 'DateTime'>,
  /** (`Process`) Defines the process to which this event is an input. */
  inputOf?: ?$ElementType<Scalars, 'ID'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Process`) Defines the process for which this event is an output. */
  outputOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agent`) The economic agent from whom the actual economic event is initiated. */
  provider: $ElementType<Scalars, 'ID'>,
  /** (`Agreement`) This economic event occurs as part of this agreement. */
  realizationOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agent`) The economic agent whom the actual economic event is for. */
  receiver: $ElementType<Scalars, 'ID'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: ?$ElementType<Scalars, 'ID'>,
  /** (`EconomicResource`) Economic resource involved in the economic event. */
  resourceInventoriedAs?: ?$ElementType<Scalars, 'ID'>,
  /** The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action. */
  resourceQuantity?: ?IMeasure,
  /** (`SpatialThing`) The new location of the receiver resource. */
  toLocation?: ?$ElementType<Scalars, 'ID'>,
  /** (`EconomicResource`) Additional economic resource on the economic event when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side. */
  toResourceInventoriedAs?: ?$ElementType<Scalars, 'ID'>,
  /** (`EconomicEvent`) References another economic event that implied this economic event, often based on a prior agreement. */
  triggeredBy?: ?$ElementType<Scalars, 'ID'>,
|};

export type EconomicEventEdge = {|
  __typename?: 'EconomicEventEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: EconomicEvent,
|};

export type EconomicEventFilterParams = {|
  action?: ?Array<$ElementType<Scalars, 'ID'>>,
  endDate?: ?$ElementType<Scalars, 'DateTime'>,
  providerId?: ?Array<$ElementType<Scalars, 'ID'>>,
  receiverId?: ?Array<$ElementType<Scalars, 'ID'>>,
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  searchString?: ?$ElementType<Scalars, 'String'>,
  startDate?: ?$ElementType<Scalars, 'DateTime'>,
|};

export type EconomicEventResponse = {|
  __typename?: 'EconomicEventResponse',
  /** Details of the newly created event. */
  economicEvent: EconomicEvent,
  /** Details of any newly created `EconomicResource`, for events that create new resources. */
  economicResource?: ?EconomicResource,
|};

export type EconomicEventUpdateParams = {|
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this economic event. */
  agreedIn?: ?$ElementType<Scalars, 'URI'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Agreement`) This economic event occurs as part of this agreement. */
  realizationOf?: ?$ElementType<Scalars, 'ID'>,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** (`EconomicEvent`) References another economic event that implied this economic event, often based on a prior agreement. */
  triggeredBy?: ?$ElementType<Scalars, 'ID'>,
|};

/** A resource which is useful to people or the ecosystem. */
export type EconomicResource = {|
  __typename?: 'EconomicResource',
  /** The current amount and unit of the economic resource for which the agent has primary rights and responsibilities, sometimes thought of as ownership. This can be either stored or derived from economic events affecting the resource. */
  accountingQuantity?: ?Measure,
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  commitments?: ?CommitmentConnection,
  /** The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  conformsTo: ResourceSpecification,
  /** Used when a stock economic resource contains items also defined as economic resources. */
  containedIn?: ?EconomicResource,
  /** Used when a stock economic resource contains units also defined as economic resources. */
  contains?: ?Array<EconomicResource>,
  /** The current place an economic resource is located. Could be at any level of granularity, from a town to an address to a warehouse location. Usually mappable. */
  currentLocation?: ?SpatialThing,
  /** Agent who has physical custody of the resource. */
  custodian?: ?Agent,
  /** All economic events with the economic resource in the resourceInventoriedAs, including all process related events, the provider resource in transfers/moves, and raise/lower. */
  economicEventsInOutFrom?: ?EconomicEventConnection,
  /** All economic events with the economic Resource in the toResourceInventoriedAs, which is the receiver resource in transfers and moves. */
  economicEventsTo?: ?EconomicEventConnection,
  id: $ElementType<Scalars, 'ID'>,
  /** The uri to an image relevant to the resource, such as a photo, diagram, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** URI addresses to images relevant to the resource. */
  imageList?: ?Array<$ElementType<Scalars, 'URI'>>,
  intents?: ?IntentConnection,
  /** Lot or batch of an economic resource, used to track forward or backwards to all occurrences of resources of that lot. Note more than one resource can be of the same lot. */
  lot?: ?ProductBatch,
  meta: RecordMeta,
  /** An informal or formal textual identifier for an item. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  next?: ?Array<EconomicEvent>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The current amount and unit of the economic resource which is under direct control of the agent.  It may be more or less than the accounting quantity. This can be either stored or derived from economic events affecting the resource. */
  onhandQuantity?: ?Measure,
  previous?: ?Array<EconomicEvent>,
  /** The agent currently with primary rights and responsibilites for the economic resource. It is the agent that is associated with the accountingQuantity of the economic resource. */
  primaryAccountable?: ?Agent,
  revision?: ?EconomicResource,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** References the ProcessSpecification of the last process the desired economic resource went through. Stage is used when the last process is important for finding proper resources, such as where the publishing process wants only documents that have gone through the editing process. */
  stage?: ?ProcessSpecification,
  /** The state of the desired economic resource (pass or fail), after coming out of a test or review process. Can be derived from the last event if a pass or fail event. */
  state?: ?Action,
  trace?: ?Array<TrackTraceItem>,
  track?: ?Array<TrackTraceItem>,
  /** Sometimes called serial number, used when each item must have a traceable identifier (like a computer). Could also be used for other unique tracking identifiers needed for resources. */
  trackingIdentifier?: ?$ElementType<Scalars, 'String'>,
  /** The unit used for use or work or cite actions for this resource. */
  unitOfEffort?: ?Unit,
|};


/** A resource which is useful to people or the ecosystem. */
export type EconomicResourceCommitmentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A resource which is useful to people or the ecosystem. */
export type EconomicResourceEconomicEventsInOutFromArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A resource which is useful to people or the ecosystem. */
export type EconomicResourceEconomicEventsToArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A resource which is useful to people or the ecosystem. */
export type EconomicResourceIntentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A resource which is useful to people or the ecosystem. */
export type EconomicResourceRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type EconomicResourceConnection = {|
  __typename?: 'EconomicResourceConnection',
  edges: Array<EconomicResourceEdge>,
  pageInfo: PageInfo,
|};

/** Input `EconomicResource` type used when sending events to setup initial resource recordings */
export type EconomicResourceCreateParams = {|
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  conformsTo?: ?$ElementType<Scalars, 'ID'>,
  /** (`EconomicResource`) Used when a stock economic resource contains items also defined as economic resources. */
  containedIn?: ?$ElementType<Scalars, 'ID'>,
  /** (`SpatialThing`) The current place an economic resource is located.  Could be at any level of granularity, from a town to an address to a warehouse location.  Usually mappable. */
  currentLocation?: ?$ElementType<Scalars, 'ID'>,
  /** The uri to an image relevant to the resource, such as a photo, diagram, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** URI addresses to images relevant to the resource. */
  imageList?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`ProductBatch`) Lot or batch of an economic resource, used to track forward or backwards to all occurrences of resources of that lot. Note more than one resource can be of the same lot. */
  lot?: ?$ElementType<Scalars, 'ID'>,
  /** An informal or formal textual identifier for an item. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** Sometimes called serial number, used when each item must have a traceable identifier (like a computer). Could also be used for other unique tracking identifiers needed for resources. */
  trackingIdentifier?: ?$ElementType<Scalars, 'String'>,
|};

export type EconomicResourceEdge = {|
  __typename?: 'EconomicResourceEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: EconomicResource,
|};

export type EconomicResourceResponse = {|
  __typename?: 'EconomicResourceResponse',
  economicResource: EconomicResource,
|};

export type EconomicResourceUpdateParams = {|
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`EconomicResource`) Used when a stock economic resource contains items also defined as economic resources. */
  containedIn?: ?$ElementType<Scalars, 'ID'>,
  /** The uri to an image relevant to the resource, such as a photo, diagram, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** URI addresses to images relevant to the resource. */
  imageList?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** (`Unit`) The unit used for use or work or cite actions for this resource. */
  unitOfEffort?: ?$ElementType<Scalars, 'ID'>,
|};

export type EventOrCommitment = Commitment | EconomicEvent;

/** Represents many-to-many relationships between commitments and economic events that fully or partially satisfy one or more commitments. */
export type Fulfillment = {|
  __typename?: 'Fulfillment',
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?Measure,
  /** The economic event which completely or partially fulfills a commitment. */
  fulfilledBy: EconomicEvent,
  /** The commitment which is completely or partially fulfilled by an economic event. */
  fulfills: Commitment,
  id: $ElementType<Scalars, 'ID'>,
  meta: RecordMeta,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?Measure,
  revision?: ?Fulfillment,
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** Represents many-to-many relationships between commitments and economic events that fully or partially satisfy one or more commitments. */
export type FulfillmentRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type FulfillmentConnection = {|
  __typename?: 'FulfillmentConnection',
  edges: Array<FulfillmentEdge>,
  pageInfo: PageInfo,
|};

export type FulfillmentCreateParams = {|
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** (`EconomicEvent`) The economic event which completely or partially fulfills a commitment. */
  fulfilledBy: $ElementType<Scalars, 'ID'>,
  /** (`Commitment`) The commitment which is completely or partially fulfilled by an economic event. */
  fulfills: $ElementType<Scalars, 'ID'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?IMeasure,
|};

export type FulfillmentEdge = {|
  __typename?: 'FulfillmentEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Fulfillment,
|};

export type FulfillmentFilterParams = {|
  /** Match Fulfillments fulfilled by any of the given EconomicEvents */
  fulfilledBy?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** Match Fulfillments fulfilling any of the given Commitments */
  fulfills?: ?Array<$ElementType<Scalars, 'ID'>>,
|};

export type FulfillmentResponse = {|
  __typename?: 'FulfillmentResponse',
  fulfillment: Fulfillment,
|};

export type FulfillmentUpdateParams = {|
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** (`EconomicEvent`) The economic event which completely or partially fulfills a commitment. */
  fulfilledBy?: ?$ElementType<Scalars, 'ID'>,
  /** (`Commitment`) The commitment which is completely or partially fulfilled by an economic event. */
  fulfills?: ?$ElementType<Scalars, 'ID'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?IMeasure,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

/** Mutation input structure for defining time durations. */
export type IDuration = {|
  /** A number representing the duration, will be paired with a unit. */
  numericDuration: $ElementType<Scalars, 'Decimal'>,
  /** A unit of measure. */
  unitType: TimeUnit,
|};

/** Mutation input structure for defining measurements. Should be nulled if not present, rather than empty. */
export type IMeasure = {|
  /** A number representing the quantity, will be paired with a unit. */
  hasNumericalValue: $ElementType<Scalars, 'Decimal'>,
  /** (`Unit`) A unit of measure. */
  hasUnit?: ?$ElementType<Scalars, 'ID'>,
|};

/** A planned economic flow which has not been committed to, which can lead to economic events (sometimes through commitments). */
export type Intent = {|
  __typename?: 'Intent',
  /** Relates an intent to a verb, such as consume, produce, work, improve, etc. */
  action: Action,
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this intent. */
  agreedIn?: ?$ElementType<Scalars, 'URI'>,
  /** The place where an intent would occur. Usually mappable. */
  atLocation?: ?SpatialThing,
  /** The total quantity of the offered resource available. */
  availableQuantity?: ?Measure,
  /** The intent can be safely deleted, has no dependent information. */
  deletable?: ?$ElementType<Scalars, 'Boolean'>,
  /** The time something is expected to be complete. */
  due?: ?$ElementType<Scalars, 'DateTime'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?Measure,
  /** The intent is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  /** The planned beginning of the intent. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned end of the intent. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned date/time for the intent. Can be used instead of beginning and end. */
  hasPointInTime?: ?$ElementType<Scalars, 'DateTime'>,
  id: $ElementType<Scalars, 'ID'>,
  /** The uri to an image relevant to the intent, such as a photo. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** URI addresses to images relevant to the intent. */
  imageList?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<AccountingScope>,
  /** Defines the process to which this intent is an input. */
  inputOf?: ?Process,
  meta: RecordMeta,
  /** An informal or formal textual identifier for an intent. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** Defines the process to which this intent is an output. */
  outputOf?: ?Process,
  /** The economic agent from whom the intent is initiated. This implies that the intent is an offer. */
  provider?: ?Agent,
  publishedIn?: ?Array<ProposedIntent>,
  /** The economic agent whom the intent is for.  This implies that the intent is a request. */
  receiver?: ?Agent,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: ?ResourceSpecification,
  /** Economic resource involved in the intent. */
  resourceInventoriedAs?: ?EconomicResource,
  /** The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action. */
  resourceQuantity?: ?Measure,
  revision?: ?Intent,
  revisionId: $ElementType<Scalars, 'ID'>,
  satisfiedBy?: ?Array<Satisfaction>,
  /** Additional economic resource on the intent when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side. */
  toResourceInventoriedAs?: ?EconomicResource,
|};


/** A planned economic flow which has not been committed to, which can lead to economic events (sometimes through commitments). */
export type IntentRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type IntentConnection = {|
  __typename?: 'IntentConnection',
  edges: Array<IntentEdge>,
  pageInfo: PageInfo,
|};

export type IntentCreateParams = {|
  /** (`Action`) Relates an intent to a verb, such as consume, produce, work, improve, etc. */
  action: $ElementType<Scalars, 'ID'>,
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this intent. */
  agreedIn?: ?$ElementType<Scalars, 'URI'>,
  /** (`SpatialThing`) The place where an intent occurs. Usually mappable. */
  atLocation?: ?$ElementType<Scalars, 'ID'>,
  /** The total quantity of the offered resource available. */
  availableQuantity?: ?IMeasure,
  /** The time something is expected to be complete. */
  due?: ?$ElementType<Scalars, 'DateTime'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** The intent is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  /** The planned beginning of the intent. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned end of the intent. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned date/time for the intent. Can be used instead of beginning and end. */
  hasPointInTime?: ?$ElementType<Scalars, 'DateTime'>,
  /** The uri to an image relevant to the intent, such as a photo. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** URI addresses to images relevant to the intent. */
  imageList?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** (`Process`) Defines the process to which this intent is an input. */
  inputOf?: ?$ElementType<Scalars, 'ID'>,
  /** An informal or formal textual identifier for an intent. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Process`) Defines the process to which this intent is an output. */
  outputOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agent`) The economic agent from whom the intent is initiated. This implies that the intent is an offer. */
  provider?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agent`) The economic agent whom the intent is for.  This implies that the intent is a request. */
  receiver?: ?$ElementType<Scalars, 'ID'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: ?$ElementType<Scalars, 'ID'>,
  /** (`EconomicResource`) When a specific `EconomicResource` is known which can service the `Intent`, this defines that resource. */
  resourceInventoriedAs?: ?$ElementType<Scalars, 'ID'>,
  /** The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action. */
  resourceQuantity?: ?IMeasure,
|};

export type IntentEdge = {|
  __typename?: 'IntentEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Intent,
|};

export type IntentFilterParams = {|
  action?: ?Array<$ElementType<Scalars, 'ID'>>,
  agent?: ?Array<$ElementType<Scalars, 'ID'>>,
  atLocation?: ?Array<$ElementType<Scalars, 'ID'>>,
  classifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  endDate?: ?$ElementType<Scalars, 'DateTime'>,
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  provider?: ?Array<$ElementType<Scalars, 'ID'>>,
  providerId?: ?Array<$ElementType<Scalars, 'ID'>>,
  receiver?: ?Array<$ElementType<Scalars, 'ID'>>,
  receiverId?: ?Array<$ElementType<Scalars, 'ID'>>,
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  resourceConformsTo?: ?Array<$ElementType<Scalars, 'ID'>>,
  searchString?: ?$ElementType<Scalars, 'String'>,
  startDate?: ?$ElementType<Scalars, 'DateTime'>,
  status?: ?$ElementType<Scalars, 'String'>,
  tagIds?: ?Array<$ElementType<Scalars, 'ID'>>,
|};

export type IntentResponse = {|
  __typename?: 'IntentResponse',
  intent: Intent,
|};

export type IntentUpdateParams = {|
  /** (`Action`) Relates an intent to a verb, such as consume, produce, work, improve, etc. */
  action?: ?$ElementType<Scalars, 'ID'>,
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this intent. */
  agreedIn?: ?$ElementType<Scalars, 'URI'>,
  /** (`SpatialThing`) The place where an intent occurs. Usually mappable. */
  atLocation?: ?$ElementType<Scalars, 'ID'>,
  /** The total quantity of the offered resource available. */
  availableQuantity?: ?IMeasure,
  /** The time something is expected to be complete. */
  due?: ?$ElementType<Scalars, 'DateTime'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** The intent is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  /** The planned beginning of the intent. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned end of the intent. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned date/time for the intent. Can be used instead of beginning and end. */
  hasPointInTime?: ?$ElementType<Scalars, 'DateTime'>,
  /** The uri to an image relevant to the intent, such as a photo. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** URI addresses to images relevant to the intent. */
  imageList?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** (`Process`) Defines the process to which this intent is an input. */
  inputOf?: ?$ElementType<Scalars, 'ID'>,
  /** An informal or formal textual identifier for an intent. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Process`) Defines the process to which this intent is an output. */
  outputOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agent`) The economic agent from whom the intent is initiated. This implies that the intent is an offer. */
  provider?: ?$ElementType<Scalars, 'ID'>,
  /** (`Agent`) The economic agent whom the intent is for.  This implies that the intent is a request. */
  receiver?: ?$ElementType<Scalars, 'ID'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: ?$ElementType<Scalars, 'ID'>,
  /** (`EconomicResource`) When a specific `EconomicResource` is known which can service the `Intent`, this defines that resource. */
  resourceInventoriedAs?: ?$ElementType<Scalars, 'ID'>,
  /** The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action. */
  resourceQuantity?: ?IMeasure,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type IntentsOrder = {|
  availableQuantity?: ?Sort,
  due?: ?Sort,
  effortQuantity?: ?Sort,
  endTime?: ?Sort,
  name?: ?Sort,
  resourceQuantity?: ?Sort,
  startTime?: ?Sort,
|};

/**
 * Semantic meaning for measurements: binds a quantity to its measurement unit.
 * See http://www.qudt.org/pages/QUDToverviewPage.html
 */
export type Measure = {|
  __typename?: 'Measure',
  /** A number representing the quantity, will be paired with a unit. */
  hasNumericalValue: $ElementType<Scalars, 'Decimal'>,
  /** A unit of measure. */
  hasUnit?: ?Unit,
|};

export type Mutation = {|
  __typename?: 'Mutation',
  createAgentRelationship: AgentRelationshipResponse,
  createAgentRelationshipRole: AgentRelationshipRoleResponse,
  createAgreement: AgreementResponse,
  createAppreciation: AppreciationResponse,
  createClaim: ClaimResponse,
  createCommitment: CommitmentResponse,
  /** Registers a new (`EconomicEvent`) with the collaboration space. Also serves as a means to register (`EconomicResource`) as well, instead of createEconomicResource */
  createEconomicEvent: EconomicEventResponse,
  createFulfillment: FulfillmentResponse,
  createIntent: IntentResponse,
  /** Registers a new organization (group agent) with the collaboration space */
  createOrganization: OrganizationResponse,
  /** Registers a new (human) person with the collaboration space */
  createPerson: PersonResponse,
  createPlan: PlanResponse,
  createProcess: ProcessResponse,
  createProcessSpecification: ProcessSpecificationResponse,
  createProductBatch: ProductBatchResponse,
  createProposal: ProposalResponse,
  createRecipeExchange: RecipeExchangeResponse,
  createRecipeFlow: RecipeFlowResponse,
  createRecipeProcess: RecipeProcessResponse,
  createResourceSpecification: ResourceSpecificationResponse,
  createSatisfaction: SatisfactionResponse,
  createScenario: ScenarioResponse,
  createScenarioDefinition: ScenarioDefinitionResponse,
  createSettlement: SettlementResponse,
  createSpatialThing: SpatialThingResponse,
  createUnit: UnitResponse,
  deleteAgentRelationship: $ElementType<Scalars, 'Boolean'>,
  deleteAgentRelationshipRole: $ElementType<Scalars, 'Boolean'>,
  deleteAgreement: $ElementType<Scalars, 'Boolean'>,
  deleteAppreciation: $ElementType<Scalars, 'Boolean'>,
  deleteClaim: $ElementType<Scalars, 'Boolean'>,
  deleteCommitment: $ElementType<Scalars, 'Boolean'>,
  deleteFulfillment: $ElementType<Scalars, 'Boolean'>,
  deleteIntent: $ElementType<Scalars, 'Boolean'>,
  /** Erase record of an organization and thus remove it from the collaboration space */
  deleteOrganization: $ElementType<Scalars, 'Boolean'>,
  /** Erase record of a person and thus remove them from the collaboration space */
  deletePerson: $ElementType<Scalars, 'Boolean'>,
  deletePlan: $ElementType<Scalars, 'Boolean'>,
  deleteProcess: $ElementType<Scalars, 'Boolean'>,
  deleteProcessSpecification: $ElementType<Scalars, 'Boolean'>,
  deleteProductBatch: $ElementType<Scalars, 'Boolean'>,
  deleteProposal: $ElementType<Scalars, 'Boolean'>,
  deleteProposedIntent: $ElementType<Scalars, 'Boolean'>,
  deleteProposedTo: $ElementType<Scalars, 'Boolean'>,
  deleteRecipeExchange: $ElementType<Scalars, 'Boolean'>,
  deleteRecipeFlow: $ElementType<Scalars, 'Boolean'>,
  deleteRecipeProcess: $ElementType<Scalars, 'Boolean'>,
  deleteResourceSpecification: $ElementType<Scalars, 'Boolean'>,
  deleteSatisfaction: $ElementType<Scalars, 'Boolean'>,
  deleteScenario: $ElementType<Scalars, 'Boolean'>,
  deleteScenarioDefinition: $ElementType<Scalars, 'Boolean'>,
  deleteSettlement: $ElementType<Scalars, 'Boolean'>,
  deleteSpatialThing: $ElementType<Scalars, 'Boolean'>,
  deleteUnit: $ElementType<Scalars, 'Boolean'>,
  /**
   * Include an existing intent as part of a proposal.
   * @param publishedIn the (`Proposal`) to include the intent in
   * @param publishes the (`Intent`) to include as part of the proposal
   */
  proposeIntent: ProposedIntentResponse,
  /**
   * Send a proposal to another agent.
   * @param proposed the (`Proposal`) to send to an involved agent
   * @param proposedTo the (`Agent`) to include in the proposal
   */
  proposeTo: ProposedToResponse,
  updateAgentRelationship: AgentRelationshipResponse,
  updateAgentRelationshipRole: AgentRelationshipRoleResponse,
  updateAgreement: AgreementResponse,
  updateAppreciation: AppreciationResponse,
  updateClaim: ClaimResponse,
  updateCommitment: CommitmentResponse,
  updateEconomicEvent: EconomicEventResponse,
  updateEconomicResource: EconomicResourceResponse,
  updateFulfillment: FulfillmentResponse,
  updateIntent: IntentResponse,
  /** Update organization profile details */
  updateOrganization: OrganizationResponse,
  /** Update profile details */
  updatePerson: PersonResponse,
  updatePlan: PlanResponse,
  updateProcess: ProcessResponse,
  updateProcessSpecification: ProcessSpecificationResponse,
  updateProductBatch: ProductBatchResponse,
  updateProposal: ProposalResponse,
  updateRecipeExchange: RecipeExchangeResponse,
  updateRecipeFlow: RecipeFlowResponse,
  updateRecipeProcess: RecipeProcessResponse,
  updateResourceSpecification: ResourceSpecificationResponse,
  updateSatisfaction: SatisfactionResponse,
  updateScenario: ScenarioResponse,
  updateScenarioDefinition: ScenarioDefinitionResponse,
  updateSettlement: SettlementResponse,
  updateSpatialThing: SpatialThingResponse,
  updateUnit: UnitResponse,
|};


export type MutationCreateAgentRelationshipArgs = {|
  relationship: AgentRelationshipCreateParams,
|};


export type MutationCreateAgentRelationshipRoleArgs = {|
  agentRelationshipRole: AgentRelationshipRoleCreateParams,
|};


export type MutationCreateAgreementArgs = {|
  agreement?: ?AgreementCreateParams,
|};


export type MutationCreateAppreciationArgs = {|
  appreciation: AppreciationCreateParams,
|};


export type MutationCreateClaimArgs = {|
  claim: ClaimCreateParams,
|};


export type MutationCreateCommitmentArgs = {|
  commitment: CommitmentCreateParams,
|};


export type MutationCreateEconomicEventArgs = {|
  event: EconomicEventCreateParams,
  newInventoriedResource?: ?EconomicResourceCreateParams,
|};


export type MutationCreateFulfillmentArgs = {|
  fulfillment: FulfillmentCreateParams,
|};


export type MutationCreateIntentArgs = {|
  intent: IntentCreateParams,
|};


export type MutationCreateOrganizationArgs = {|
  organization: OrganizationCreateParams,
|};


export type MutationCreatePersonArgs = {|
  person: AgentCreateParams,
|};


export type MutationCreatePlanArgs = {|
  plan: PlanCreateParams,
|};


export type MutationCreateProcessArgs = {|
  process: ProcessCreateParams,
|};


export type MutationCreateProcessSpecificationArgs = {|
  processSpecification: ProcessSpecificationCreateParams,
|};


export type MutationCreateProductBatchArgs = {|
  productBatch: ProductBatchCreateParams,
|};


export type MutationCreateProposalArgs = {|
  proposal: ProposalCreateParams,
|};


export type MutationCreateRecipeExchangeArgs = {|
  recipeExchange: RecipeExchangeCreateParams,
|};


export type MutationCreateRecipeFlowArgs = {|
  recipeFlow: RecipeFlowCreateParams,
|};


export type MutationCreateRecipeProcessArgs = {|
  recipeProcess: RecipeProcessCreateParams,
|};


export type MutationCreateResourceSpecificationArgs = {|
  resourceSpecification: ResourceSpecificationCreateParams,
|};


export type MutationCreateSatisfactionArgs = {|
  satisfaction: SatisfactionCreateParams,
|};


export type MutationCreateScenarioArgs = {|
  plan: ScenarioCreateParams,
|};


export type MutationCreateScenarioDefinitionArgs = {|
  plan: ScenarioDefinitionCreateParams,
|};


export type MutationCreateSettlementArgs = {|
  settlement: SettlementCreateParams,
|};


export type MutationCreateSpatialThingArgs = {|
  spatialThing: SpatialThingCreateParams,
|};


export type MutationCreateUnitArgs = {|
  unit: UnitCreateParams,
|};


export type MutationDeleteAgentRelationshipArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteAgentRelationshipRoleArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteAgreementArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteAppreciationArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteClaimArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteCommitmentArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteFulfillmentArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteIntentArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteOrganizationArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeletePersonArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeletePlanArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteProcessArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteProcessSpecificationArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteProductBatchArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteProposalArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteProposedIntentArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteProposedToArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteRecipeExchangeArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteRecipeFlowArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteRecipeProcessArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteResourceSpecificationArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteSatisfactionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteScenarioArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteScenarioDefinitionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteSettlementArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteSpatialThingArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationDeleteUnitArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


export type MutationProposeIntentArgs = {|
  publishedIn: $ElementType<Scalars, 'ID'>,
  publishes: $ElementType<Scalars, 'ID'>,
  reciprocal?: ?$ElementType<Scalars, 'Boolean'>,
|};


export type MutationProposeToArgs = {|
  proposed: $ElementType<Scalars, 'ID'>,
  proposedTo: $ElementType<Scalars, 'ID'>,
|};


export type MutationUpdateAgentRelationshipArgs = {|
  relationship: AgentRelationshipUpdateParams,
|};


export type MutationUpdateAgentRelationshipRoleArgs = {|
  agentRelationshipRole: AgentRelationshipRoleUpdateParams,
|};


export type MutationUpdateAgreementArgs = {|
  agreement?: ?AgreementUpdateParams,
|};


export type MutationUpdateAppreciationArgs = {|
  appreciation: AppreciationUpdateParams,
|};


export type MutationUpdateClaimArgs = {|
  claim: ClaimUpdateParams,
|};


export type MutationUpdateCommitmentArgs = {|
  commitment: CommitmentUpdateParams,
|};


export type MutationUpdateEconomicEventArgs = {|
  event: EconomicEventUpdateParams,
|};


export type MutationUpdateEconomicResourceArgs = {|
  resource: EconomicResourceUpdateParams,
|};


export type MutationUpdateFulfillmentArgs = {|
  fulfillment: FulfillmentUpdateParams,
|};


export type MutationUpdateIntentArgs = {|
  intent: IntentUpdateParams,
|};


export type MutationUpdateOrganizationArgs = {|
  organization: OrganizationUpdateParams,
|};


export type MutationUpdatePersonArgs = {|
  person: AgentUpdateParams,
|};


export type MutationUpdatePlanArgs = {|
  plan: PlanUpdateParams,
|};


export type MutationUpdateProcessArgs = {|
  process: ProcessUpdateParams,
|};


export type MutationUpdateProcessSpecificationArgs = {|
  processSpecification: ProcessSpecificationUpdateParams,
|};


export type MutationUpdateProductBatchArgs = {|
  productBatch: ProductBatchUpdateParams,
|};


export type MutationUpdateProposalArgs = {|
  proposal: ProposalUpdateParams,
|};


export type MutationUpdateRecipeExchangeArgs = {|
  recipeExchange: RecipeExchangeUpdateParams,
|};


export type MutationUpdateRecipeFlowArgs = {|
  recipeFlow: RecipeFlowUpdateParams,
|};


export type MutationUpdateRecipeProcessArgs = {|
  recipeProcess: RecipeProcessUpdateParams,
|};


export type MutationUpdateResourceSpecificationArgs = {|
  resourceSpecification: ResourceSpecificationUpdateParams,
|};


export type MutationUpdateSatisfactionArgs = {|
  satisfaction: SatisfactionUpdateParams,
|};


export type MutationUpdateScenarioArgs = {|
  plan: ScenarioUpdateParams,
|};


export type MutationUpdateScenarioDefinitionArgs = {|
  plan: ScenarioDefinitionUpdateParams,
|};


export type MutationUpdateSettlementArgs = {|
  settlement: SettlementUpdateParams,
|};


export type MutationUpdateSpatialThingArgs = {|
  spatialThing: SpatialThingUpdateParams,
|};


export type MutationUpdateUnitArgs = {|
  unit: UnitUpdateParams,
|};

/** A formal or informal group, or legal organization. */
export type Organization = {|
  ...Agent,
  ...{|
    __typename?: 'Organization',
    claims?: ?IntentConnection,
    claimsAsProvider?: ?IntentConnection,
    claimsAsReceiver?: ?IntentConnection,
    claimsInScope?: ?IntentConnection,
    /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
    commitments?: ?CommitmentConnection,
    commitmentsAsProvider?: ?CommitmentConnection,
    commitmentsAsReceiver?: ?CommitmentConnection,
    commitmentsInScope?: ?CommitmentConnection,
    economicEvents?: ?EconomicEventConnection,
    economicEventsAsProvider?: ?EconomicEventConnection,
    economicEventsAsReceiver?: ?EconomicEventConnection,
    economicEventsInScope?: ?EconomicEventConnection,
    id: $ElementType<Scalars, 'ID'>,
    /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
    intents?: ?IntentConnection,
    intentsAsProvider?: ?IntentConnection,
    intentsAsReceiver?: ?IntentConnection,
    intentsInScope?: ?IntentConnection,
    inventoriedEconomicResources?: ?EconomicResourceConnection,
    meta: RecordMeta,
    /** The name that this agent will be referred to by. */
  name: $ElementType<Scalars, 'String'>,
    /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
    plans?: ?PlanConnection,
    /** The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: ?SpatialThing,
    processes?: ?ProcessConnection,
    proposals?: ?ProposalConnection,
    proposalsInScope?: ?ProposalConnection,
    proposalsTo?: ?ProposalConnection,
    relationships?: ?AgentRelationshipConnection,
    relationshipsAsObject?: ?AgentRelationshipConnection,
    relationshipsAsSubject?: ?AgentRelationshipConnection,
    revision?: ?Organization,
    revisionId: $ElementType<Scalars, 'ID'>,
    roles?: ?Array<AgentRelationshipRole>,
    scenariosInScope?: ?ScenarioConnection,
  |}
|};


/** A formal or informal group, or legal organization. */
export type OrganizationClaimsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationClaimsAsProviderArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationClaimsAsReceiverArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationClaimsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationCommitmentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentCommitmentFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationCommitmentsAsProviderArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationCommitmentsAsReceiverArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationCommitmentsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationEconomicEventsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentEventFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationEconomicEventsAsProviderArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationEconomicEventsAsReceiverArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationEconomicEventsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationIntentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentIntentFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationIntentsAsProviderArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationIntentsAsReceiverArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationIntentsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationInventoriedEconomicResourcesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentResourceFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationPlansArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentPlanFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationProcessesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentProcessFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationProposalsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentProposalSearchParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationProposalsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationProposalsToArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationRelationshipsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentRelationshipFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationRelationshipsAsObjectArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentRelationshipFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationRelationshipsAsSubjectArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentRelationshipFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** A formal or informal group, or legal organization. */
export type OrganizationScenariosInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};

export type OrganizationConnection = {|
  __typename?: 'OrganizationConnection',
  edges: Array<OrganizationEdge>,
  pageInfo: PageInfo,
|};

export type OrganizationCreateParams = {|
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** An informal or formal textual identifier for an agent. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`SpatialThing`) The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: ?$ElementType<Scalars, 'ID'>,
|};

export type OrganizationEdge = {|
  __typename?: 'OrganizationEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Organization,
|};

export type OrganizationResponse = {|
  __typename?: 'OrganizationResponse',
  agent: Organization,
|};

export type OrganizationUpdateParams = {|
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** An informal or formal textual identifier for an agent. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`SpatialThing`) The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: ?$ElementType<Scalars, 'ID'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

/** Cursors for pagination */
export type PageInfo = {|
  __typename?: 'PageInfo',
  /** Cursor pointing to the last of the results returned, to be used with `after` query parameter if the backend supports forward pagination. */
  endCursor?: ?$ElementType<Scalars, 'String'>,
  /** True if there are more results after `endCursor`. If unable to be determined, implementations should return `true` to allow for requerying. */
  hasNextPage: $ElementType<Scalars, 'Boolean'>,
  /** True if there are more results before `startCursor`. If unable to be determined, implementations should return `true` to allow for requerying. */
  hasPreviousPage: $ElementType<Scalars, 'Boolean'>,
  /** The number of items requested per page. Allows the storage backend to indicate this when it is responsible for setting a default and the client does not provide it. Note this may be different to the number of items returned, if there is less than 1 page of results. */
  pageLimit?: ?$ElementType<Scalars, 'Int'>,
  /** Cursor pointing to the first of the results returned, to be used with `before` query parameter if the backend supports reverse pagination. */
  startCursor?: ?$ElementType<Scalars, 'String'>,
  /** The total result count, if it can be determined. */
  totalCount?: ?$ElementType<Scalars, 'Int'>,
|};

/** A natural person. */
export type Person = {|
  ...Agent,
  ...{|
    __typename?: 'Person',
    claims?: ?IntentConnection,
    claimsAsProvider?: ?IntentConnection,
    claimsAsReceiver?: ?IntentConnection,
    claimsInScope?: ?IntentConnection,
    /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
    commitments?: ?CommitmentConnection,
    commitmentsAsProvider?: ?CommitmentConnection,
    commitmentsAsReceiver?: ?CommitmentConnection,
    commitmentsInScope?: ?CommitmentConnection,
    economicEvents?: ?EconomicEventConnection,
    economicEventsAsProvider?: ?EconomicEventConnection,
    economicEventsAsReceiver?: ?EconomicEventConnection,
    economicEventsInScope?: ?EconomicEventConnection,
    id: $ElementType<Scalars, 'ID'>,
    /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
    intents?: ?IntentConnection,
    intentsAsProvider?: ?IntentConnection,
    intentsAsReceiver?: ?IntentConnection,
    intentsInScope?: ?IntentConnection,
    inventoriedEconomicResources?: ?EconomicResourceConnection,
    meta: RecordMeta,
    /** The name that this agent will be referred to by. */
  name: $ElementType<Scalars, 'String'>,
    /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
    plans?: ?PlanConnection,
    /** The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: ?SpatialThing,
    processes?: ?ProcessConnection,
    proposals?: ?ProposalConnection,
    proposalsInScope?: ?ProposalConnection,
    proposalsTo?: ?ProposalConnection,
    relationships?: ?AgentRelationshipConnection,
    relationshipsAsObject?: ?AgentRelationshipConnection,
    relationshipsAsSubject?: ?AgentRelationshipConnection,
    revision?: ?Person,
    revisionId: $ElementType<Scalars, 'ID'>,
    roles?: ?Array<AgentRelationshipRole>,
    scenariosInScope?: ?ScenarioConnection,
  |}
|};


/** A natural person. */
export type PersonClaimsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonClaimsAsProviderArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonClaimsAsReceiverArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonClaimsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonCommitmentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentCommitmentFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonCommitmentsAsProviderArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonCommitmentsAsReceiverArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonCommitmentsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonEconomicEventsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentEventFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonEconomicEventsAsProviderArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonEconomicEventsAsReceiverArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonEconomicEventsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonIntentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentIntentFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonIntentsAsProviderArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonIntentsAsReceiverArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonIntentsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonInventoriedEconomicResourcesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentResourceFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonPlansArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentPlanFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonProcessesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentProcessFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonProposalsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentProposalSearchParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonProposalsInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonProposalsToArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonRelationshipsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentRelationshipFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonRelationshipsAsObjectArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentRelationshipFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonRelationshipsAsSubjectArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentRelationshipFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A natural person. */
export type PersonRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** A natural person. */
export type PersonScenariosInScopeArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};

export type PersonConnection = {|
  __typename?: 'PersonConnection',
  edges: Array<PersonEdge>,
  pageInfo: PageInfo,
|};

export type PersonEdge = {|
  __typename?: 'PersonEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Person,
|};

export type PersonResponse = {|
  __typename?: 'PersonResponse',
  agent: Person,
|};

/** A logical collection of processes that constitute a body of planned work with defined deliverable(s). */
export type Plan = {|
  __typename?: 'Plan',
  /** The time the plan was made. */
  created?: ?$ElementType<Scalars, 'DateTime'>,
  /** The plan is able to be deleted or not. */
  deletable?: ?$ElementType<Scalars, 'Boolean'>,
  /** The time the plan is expected to be complete. */
  due?: ?$ElementType<Scalars, 'DateTime'>,
  id: $ElementType<Scalars, 'ID'>,
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<AccountingScope>,
  independentDemands?: ?Array<Commitment>,
  involvedAgents?: ?AgentConnection,
  meta: RecordMeta,
  /** An informal or formal textual identifier for a plan. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  nonProcessCommitments?: ?Array<Commitment>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  processes?: ?Array<Process>,
  /** This plan refines a scenario, making it operational. */
  refinementOf?: ?Scenario,
  revision?: ?Plan,
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** A logical collection of processes that constitute a body of planned work with defined deliverable(s). */
export type PlanInvolvedAgentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A logical collection of processes that constitute a body of planned work with defined deliverable(s). */
export type PlanProcessesArgs = {|
  filter?: ?PlanProcessFilterParams,
|};


/** A logical collection of processes that constitute a body of planned work with defined deliverable(s). */
export type PlanRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type PlanConnection = {|
  __typename?: 'PlanConnection',
  edges: Array<PlanEdge>,
  pageInfo: PageInfo,
|};

export type PlanCreateParams = {|
  /** The time the plan was made. */
  created?: ?$ElementType<Scalars, 'DateTime'>,
  /** The time the plan is expected to be complete. */
  due?: ?$ElementType<Scalars, 'DateTime'>,
  /** An informal or formal textual identifier for a plan. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Scenario`) This plan refines a scenario, making it operational. */
  refinementOf?: ?$ElementType<Scalars, 'ID'>,
|};

export type PlanEdge = {|
  __typename?: 'PlanEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Plan,
|};

/** Query parameters for reading `Process`es related to a `Plan` */
export type PlanProcessFilterParams = {|
  after?: ?$ElementType<Scalars, 'DateTime'>,
  before?: ?$ElementType<Scalars, 'DateTime'>,
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  searchString?: ?$ElementType<Scalars, 'String'>,
|};

export type PlanResponse = {|
  __typename?: 'PlanResponse',
  plan: Plan,
|};

export type PlanUpdateParams = {|
  /** The time the plan was made. */
  created?: ?$ElementType<Scalars, 'DateTime'>,
  /** The time the plan is expected to be complete. */
  due?: ?$ElementType<Scalars, 'DateTime'>,
  /** An informal or formal textual identifier for a plan. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Scenario`) This plan refines a scenario, making it operational. */
  refinementOf?: ?$ElementType<Scalars, 'ID'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type Process = {|
  __typename?: 'Process',
  /** The definition or specification for a process. */
  basedOn?: ?ProcessSpecification,
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  committedInputs?: ?Array<Commitment>,
  committedOutputs?: ?Array<Commitment>,
  /** The process can be safely deleted, has no dependent information. */
  deletable?: ?$ElementType<Scalars, 'Boolean'>,
  /** The process is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  /** The planned beginning of the process. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned end of the process. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  id: $ElementType<Scalars, 'ID'>,
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<AccountingScope>,
  intendedInputs?: ?Array<Intent>,
  intendedOutputs?: ?Array<Intent>,
  involvedAgents?: ?AgentConnection,
  meta: RecordMeta,
  /** An informal or formal textual identifier for a process. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** The process with its inputs and outputs is part of the scenario. */
  nestedIn?: ?Scenario,
  next?: ?Array<EconomicEvent>,
  nextProcesses?: ?Array<Process>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  observedInputs?: ?Array<EconomicEvent>,
  observedOutputs?: ?Array<EconomicEvent>,
  /** The process with its inputs and outputs is part of the plan. */
  plannedWithin?: ?Plan,
  previous?: ?Array<EconomicEvent>,
  previousProcesses?: ?Array<Process>,
  revision?: ?Process,
  revisionId: $ElementType<Scalars, 'ID'>,
  unplannedInputs?: ?Array<EconomicEvent>,
  unplannedOutputs?: ?Array<EconomicEvent>,
  workingAgents?: ?AgentConnection,
|};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessCommittedInputsArgs = {|
  filter?: ?ProcessCommitmentFilterParams,
|};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessCommittedOutputsArgs = {|
  filter?: ?ProcessCommitmentFilterParams,
|};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessIntendedInputsArgs = {|
  filter?: ?ProcessIntentFilterParams,
|};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessIntendedOutputsArgs = {|
  filter?: ?ProcessIntentFilterParams,
|};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessInvolvedAgentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessObservedInputsArgs = {|
  filter?: ?ProcessEventFilterParams,
|};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessObservedOutputsArgs = {|
  filter?: ?ProcessEventFilterParams,
|};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessUnplannedInputsArgs = {|
  filter?: ?ProcessEventFilterParams,
|};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessUnplannedOutputsArgs = {|
  filter?: ?ProcessEventFilterParams,
|};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessWorkingAgentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};

export type ProcessCommitmentFilterParams = {|
  action?: ?Array<$ElementType<Scalars, 'ID'>>,
  endDate?: ?$ElementType<Scalars, 'DateTime'>,
  providerId?: ?Array<$ElementType<Scalars, 'ID'>>,
  receiverId?: ?Array<$ElementType<Scalars, 'ID'>>,
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  searchString?: ?$ElementType<Scalars, 'String'>,
  startDate?: ?$ElementType<Scalars, 'DateTime'>,
|};

export type ProcessConnection = {|
  __typename?: 'ProcessConnection',
  edges: Array<ProcessEdge>,
  pageInfo: PageInfo,
|};

export type ProcessCreateParams = {|
  /** (`ProcessSpecification`) The definition or specification for a process. */
  basedOn?: ?$ElementType<Scalars, 'ID'>,
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** The process is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  /** The planned beginning of the process. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned end of the process. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** An informal or formal textual identifier for a process. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Plan`) The process with its inputs and outputs is part of the plan. */
  plannedWithin?: ?$ElementType<Scalars, 'ID'>,
|};

export type ProcessEdge = {|
  __typename?: 'ProcessEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Process,
|};

export type ProcessEventFilterParams = {|
  action?: ?Array<$ElementType<Scalars, 'ID'>>,
  endDate?: ?$ElementType<Scalars, 'DateTime'>,
  providerId?: ?Array<$ElementType<Scalars, 'ID'>>,
  receiverId?: ?Array<$ElementType<Scalars, 'ID'>>,
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  searchString?: ?$ElementType<Scalars, 'String'>,
  startDate?: ?$ElementType<Scalars, 'DateTime'>,
|};

export type ProcessFilterParams = {|
  classifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  endDate?: ?$ElementType<Scalars, 'DateTime'>,
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  searchString?: ?$ElementType<Scalars, 'String'>,
  startDate?: ?$ElementType<Scalars, 'DateTime'>,
|};

export type ProcessIntentFilterParams = {|
  action?: ?Array<$ElementType<Scalars, 'ID'>>,
  endDate?: ?$ElementType<Scalars, 'DateTime'>,
  providerId?: ?Array<$ElementType<Scalars, 'ID'>>,
  receiverId?: ?Array<$ElementType<Scalars, 'ID'>>,
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  searchString?: ?$ElementType<Scalars, 'String'>,
  startDate?: ?$ElementType<Scalars, 'DateTime'>,
|};

export type ProcessResponse = {|
  __typename?: 'ProcessResponse',
  process: Process,
|};

/** Specifies the kind of process. */
export type ProcessSpecification = {|
  __typename?: 'ProcessSpecification',
  commitmentsRequiringStage?: ?CommitmentConnection,
  conformingProcesses?: ?ProcessConnection,
  conformingRecipeProcesses?: ?RecipeProcessConnection,
  id: $ElementType<Scalars, 'ID'>,
  /** The image of the process. */
  image?: ?$ElementType<Scalars, 'String'>,
  meta: RecordMeta,
  /** An informal or formal textual identifier for the process. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  recipeFlowsRequiringStage?: ?RecipeFlowConnection,
  resourcesCurrentlyAtStage?: ?EconomicResourceConnection,
  revision?: ?ProcessSpecification,
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** Specifies the kind of process. */
export type ProcessSpecificationCommitmentsRequiringStageArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** Specifies the kind of process. */
export type ProcessSpecificationConformingProcessesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** Specifies the kind of process. */
export type ProcessSpecificationConformingRecipeProcessesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** Specifies the kind of process. */
export type ProcessSpecificationRecipeFlowsRequiringStageArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** Specifies the kind of process. */
export type ProcessSpecificationResourcesCurrentlyAtStageArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** Specifies the kind of process. */
export type ProcessSpecificationRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type ProcessSpecificationConnection = {|
  __typename?: 'ProcessSpecificationConnection',
  edges: Array<ProcessSpecificationEdge>,
  pageInfo: PageInfo,
|};

export type ProcessSpecificationCreateParams = {|
  /** The image of the process. */
  image?: ?$ElementType<Scalars, 'String'>,
  /** An informal or formal textual identifier for the process. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
|};

export type ProcessSpecificationEdge = {|
  __typename?: 'ProcessSpecificationEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: ProcessSpecification,
|};

export type ProcessSpecificationResponse = {|
  __typename?: 'ProcessSpecificationResponse',
  processSpecification: ProcessSpecification,
|};

export type ProcessSpecificationUpdateParams = {|
  /** The image of the process. */
  image?: ?$ElementType<Scalars, 'String'>,
  /** An informal or formal textual identifier for the process. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type ProcessUpdateParams = {|
  /** (`ProcessSpecification`) The definition or specification for a process. */
  basedOn?: ?$ElementType<Scalars, 'ID'>,
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** The process is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: ?$ElementType<Scalars, 'Boolean'>,
  /** The planned beginning of the process. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The planned end of the process. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** An informal or formal textual identifier for a process. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Plan`) The process with its inputs and outputs is part of the plan. */
  plannedWithin?: ?$ElementType<Scalars, 'ID'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

/**
 * A lot or batch, defining a resource produced at the same time in the same way.
 * From DataFoodConsortium vocabulary https://datafoodconsortium.gitbook.io/dfc-standard-documentation/.
 */
export type ProductBatch = {|
  __typename?: 'ProductBatch',
  /** The standard unique identifier of the batch. */
  batchNumber: $ElementType<Scalars, 'String'>,
  /** Expiration date of the batch, commonly used for food. */
  expiryDate?: ?$ElementType<Scalars, 'DateTime'>,
  id: $ElementType<Scalars, 'ID'>,
  meta: RecordMeta,
  /** Date the batch was produced.  Can be derived from the economic event of production. */
  productionDate?: ?$ElementType<Scalars, 'DateTime'>,
  revision?: ?ProductBatch,
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/**
 * A lot or batch, defining a resource produced at the same time in the same way.
 * From DataFoodConsortium vocabulary https://datafoodconsortium.gitbook.io/dfc-standard-documentation/.
 */
export type ProductBatchRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type ProductBatchConnection = {|
  __typename?: 'ProductBatchConnection',
  edges: Array<ProductBatchEdge>,
  pageInfo: PageInfo,
|};

export type ProductBatchCreateParams = {|
  /** The standard unique identifier of the batch. */
  batchNumber: $ElementType<Scalars, 'String'>,
  /** Expiration date of the batch, commonly used for food. */
  expiryDate?: ?$ElementType<Scalars, 'DateTime'>,
  /** Date the batch was produced.  Can be derived from the economic event of production. */
  productionDate?: ?$ElementType<Scalars, 'DateTime'>,
|};

export type ProductBatchEdge = {|
  __typename?: 'ProductBatchEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: ProductBatch,
|};

export type ProductBatchResponse = {|
  __typename?: 'ProductBatchResponse',
  productBatch: ProductBatch,
|};

export type ProductBatchUpdateParams = {|
  /** The standard unique identifier of the batch. */
  batchNumber?: ?$ElementType<Scalars, 'String'>,
  /** Expiration date of the batch, commonly used for food. */
  expiryDate?: ?$ElementType<Scalars, 'DateTime'>,
  /** Date the batch was produced.  Can be derived from the economic event of production. */
  productionDate?: ?$ElementType<Scalars, 'DateTime'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type ProductionFlowItem = EconomicResource | Process;

/** Published requests or offers, sometimes with what is expected in return. */
export type Proposal = {|
  __typename?: 'Proposal',
  /** The date and time the proposal was created. */
  created?: ?$ElementType<Scalars, 'DateTime'>,
  /** Location or area where the proposal is valid. */
  eligibleLocation?: ?SpatialThing,
  /** The beginning time of proposal publication. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The end time of proposal publication. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  id: $ElementType<Scalars, 'ID'>,
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<AccountingScope>,
  meta: RecordMeta,
  /** An informal or formal textual identifier for a proposal. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  primaryIntents?: ?Array<Intent>,
  publishedTo?: ?Array<ProposedTo>,
  publishes?: ?Array<ProposedIntent>,
  reciprocalIntents?: ?Array<Intent>,
  revision?: ?Proposal,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** This proposal contains unit based quantities, which can be multiplied to create commitments; commonly seen in a price list or e-commerce. */
  unitBased?: ?$ElementType<Scalars, 'Boolean'>,
|};


/** Published requests or offers, sometimes with what is expected in return. */
export type ProposalRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type ProposalConnection = {|
  __typename?: 'ProposalConnection',
  edges: Array<ProposalEdge>,
  pageInfo: PageInfo,
|};

export type ProposalCreateParams = {|
  /** The date and time the proposal was created. */
  created?: ?$ElementType<Scalars, 'DateTime'>,
  /** (`SpatialThing`) The location at which this proposal is eligible. */
  eligibleLocation?: ?$ElementType<Scalars, 'ID'>,
  /** The beginning time of proposal publication. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The end time of proposal publication. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** An informal or formal textual identifier for a proposal. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** This proposal contains unit based quantities, which can be multipied to create commitments; commonly seen in a price list or e-commerce. */
  unitBased?: ?$ElementType<Scalars, 'Boolean'>,
|};

export type ProposalEdge = {|
  __typename?: 'ProposalEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Proposal,
|};

export type ProposalFilterParams = {|
  active?: ?$ElementType<Scalars, 'Boolean'>,
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  isOffer?: ?$ElementType<Scalars, 'Boolean'>,
  isRequest?: ?$ElementType<Scalars, 'Boolean'>,
|};

export type ProposalResponse = {|
  __typename?: 'ProposalResponse',
  proposal: Proposal,
|};

export type ProposalUpdateParams = {|
  /** (`SpatialThing`) The location at which this proposal is eligible. */
  eligibleLocation?: ?$ElementType<Scalars, 'ID'>,
  /** The beginning date/time of proposal publication. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The end time of proposal publication. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** An informal or formal textual identifier for a proposal. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** This proposal contains unit based quantities, which can be multipied to create commitments; commonly seen in a price list or e-commerce. */
  unitBased?: ?$ElementType<Scalars, 'Boolean'>,
|};

/** Represents many-to-many relationships between Proposals and Intents, supporting including intents in multiple proposals, as well as a proposal including multiple intents. */
export type ProposedIntent = {|
  __typename?: 'ProposedIntent',
  id: $ElementType<Scalars, 'ID'>,
  meta: RecordMeta,
  /** The published proposal which this intent is part of. */
  publishedIn: Proposal,
  /** The intent which is part of this published proposal. */
  publishes: Intent,
  /** This is a reciprocal intent of this proposal, not primary. Not meant to be used for intent matching. */
  reciprocal?: ?$ElementType<Scalars, 'Boolean'>,
  revision?: ?ProposedIntent,
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** Represents many-to-many relationships between Proposals and Intents, supporting including intents in multiple proposals, as well as a proposal including multiple intents. */
export type ProposedIntentRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type ProposedIntentResponse = {|
  __typename?: 'ProposedIntentResponse',
  proposedIntent: ProposedIntent,
|};

/** An agent to which the proposal is to be published.  A proposal can be published to many agents. */
export type ProposedTo = {|
  __typename?: 'ProposedTo',
  id: $ElementType<Scalars, 'ID'>,
  meta: RecordMeta,
  /** The proposal that is published to a specific agent. */
  proposed: Proposal,
  /** The agent to which the proposal is published. */
  proposedTo: Agent,
  revision?: ?ProposedTo,
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** An agent to which the proposal is to be published.  A proposal can be published to many agents. */
export type ProposedToRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type ProposedToResponse = {|
  __typename?: 'ProposedToResponse',
  proposedTo: ProposedTo,
|};

export type Query = {|
  __typename?: 'Query',
  action?: ?Action,
  actions?: ?Array<Action>,
  /** Find an agent (person or organization) by their ID */
  agent?: ?Agent,
  /** Retrieve details of an agent relationship by its ID */
  agentRelationship?: ?AgentRelationship,
  /** Retrieve details of an agent relationship role by its ID */
  agentRelationshipRole?: ?AgentRelationshipRole,
  /** Retrieve all possible kinds of associations that agents may have with one another in this collaboration space */
  agentRelationshipRoles: AgentRelationshipRoleConnection,
  /** Retrieve details of all the relationships between all agents registered in this collaboration space */
  agentRelationships: AgentRelationshipConnection,
  /** Loads all agents publicly registered within this collaboration space */
  agents: AgentConnection,
  agreement?: ?Agreement,
  agreements: AgreementConnection,
  appreciation: Appreciation,
  appreciations: AppreciationConnection,
  claim?: ?Claim,
  claims: ClaimConnection,
  commitment?: ?Commitment,
  commitments: CommitmentConnection,
  economicEvent?: ?EconomicEvent,
  economicEvents: EconomicEventConnection,
  economicResource?: ?EconomicResource,
  economicResources: EconomicResourceConnection,
  fulfillment?: ?Fulfillment,
  fulfillments: FulfillmentConnection,
  intent?: ?Intent,
  intents: IntentConnection,
  /** Loads details of the currently authenticated REA agent */
  myAgent?: ?Agent,
  /** List all proposals that are being listed as offers. */
  offers: ProposalConnection,
  /** Find an organization (group) agent by its ID */
  organization?: ?Organization,
  /** Loads all organizations publicly registered within this collaboration space */
  organizations: OrganizationConnection,
  /** Loads all people who have publicly registered with this collaboration space. */
  people: PersonConnection,
  /** Find a person by their ID */
  person?: ?Person,
  plan?: ?Plan,
  plans: PlanConnection,
  process?: ?Process,
  processSpecification?: ?ProcessSpecification,
  processSpecifications: ProcessSpecificationConnection,
  processes: ProcessConnection,
  productBatch?: ?ProductBatch,
  productBatches: ProductBatchConnection,
  proposal?: ?Proposal,
  proposals: ProposalConnection,
  recipeExchange?: ?RecipeExchange,
  recipeExchanges: RecipeExchangeConnection,
  recipeFlow?: ?RecipeFlow,
  recipeFlows: RecipeFlowConnection,
  recipeProcess?: ?RecipeProcess,
  recipeProcesses: RecipeProcessConnection,
  /** List all proposals that are being listed as requests. */
  requests: ProposalConnection,
  resourceSpecification?: ?ResourceSpecification,
  resourceSpecifications: ResourceSpecificationConnection,
  satisfaction?: ?Satisfaction,
  satisfactions: SatisfactionConnection,
  scenario?: ?Scenario,
  scenarioDefinition?: ?ScenarioDefinition,
  scenarioDefinitions: ScenarioDefinitionConnection,
  scenarios: ScenarioConnection,
  settlement?: ?Settlement,
  settlements: SettlementConnection,
  spatialThing?: ?SpatialThing,
  spatialThings: SpatialThingConnection,
  unit?: ?Unit,
  units: UnitConnection,
|};


export type QueryActionArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryAgentArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryAgentRelationshipArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryAgentRelationshipRoleArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryAgentRelationshipRolesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryAgentRelationshipsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryAgentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryAgreementArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryAgreementsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryAppreciationArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryAppreciationsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryClaimArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryClaimsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?ClaimFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryCommitmentArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryCommitmentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?CommitmentFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryEconomicEventArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryEconomicEventsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?EconomicEventFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryEconomicResourceArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryEconomicResourcesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryFulfillmentArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryFulfillmentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?FulfillmentFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryIntentArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryIntentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?IntentFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
  orderBy?: ?IntentsOrder,
|};


export type QueryOffersArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryOrganizationArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryOrganizationsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryPeopleArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?AgentFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryPersonArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryPlanArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryPlansArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryProcessArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryProcessSpecificationArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryProcessSpecificationsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryProcessesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?ProcessFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryProductBatchArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryProductBatchesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryProposalArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryProposalsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?ProposalFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryRecipeExchangeArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryRecipeExchangesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryRecipeFlowArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryRecipeFlowsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryRecipeProcessArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryRecipeProcessesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryRequestsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryResourceSpecificationArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryResourceSpecificationsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QuerySatisfactionArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QuerySatisfactionsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  filter?: ?SatisfactionFilterParams,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryScenarioArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryScenarioDefinitionArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryScenarioDefinitionsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryScenariosArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QuerySettlementArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QuerySettlementsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QuerySpatialThingArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QuerySpatialThingsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


export type QueryUnitArgs = {|
  id: $ElementType<Scalars, 'ID'>,
|};


export type QueryUnitsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};

/** Specifies an exchange agreement as part of a recipe. */
export type RecipeExchange = {|
  __typename?: 'RecipeExchange',
  id: $ElementType<Scalars, 'ID'>,
  meta: RecordMeta,
  /** An informal or formal textual identifier for a recipe exchange. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revision?: ?RecipeExchange,
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** Specifies an exchange agreement as part of a recipe. */
export type RecipeExchangeRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type RecipeExchangeConnection = {|
  __typename?: 'RecipeExchangeConnection',
  edges: Array<RecipeExchangeEdge>,
  pageInfo: PageInfo,
|};

export type RecipeExchangeCreateParams = {|
  /** An informal or formal textual identifier for a recipe exchange. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
|};

export type RecipeExchangeEdge = {|
  __typename?: 'RecipeExchangeEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: RecipeExchange,
|};

export type RecipeExchangeResponse = {|
  __typename?: 'RecipeExchangeResponse',
  recipeExchange: RecipeExchange,
|};

export type RecipeExchangeUpdateParams = {|
  /** An informal or formal textual identifier for a recipe exchange. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

/** The specification of a resource inflow to, or outflow from, a recipe process. */
export type RecipeFlow = {|
  __typename?: 'RecipeFlow',
  /** Relates a process input or output to a verb, such as consume, produce, work, modify, etc. */
  action: Action,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?Measure,
  id: $ElementType<Scalars, 'ID'>,
  meta: RecordMeta,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** Relates a flow to its exchange agreement in a recipe. */
  recipeClauseOf?: ?RecipeExchange,
  /** Relates an input flow to its process in a recipe. */
  recipeInputOf?: ?RecipeProcess,
  /** Relates an output flow to its process in a recipe. */
  recipeOutputOf?: ?RecipeProcess,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** The resource definition referenced by this flow in the recipe. */
  resourceConformsTo: ResourceSpecification,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?Measure,
  revision?: ?RecipeFlow,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** The state of the desired economic resource (pass or fail), after coming out of a test or review process. */
  state?: ?$ElementType<Scalars, 'String'>,
|};


/** The specification of a resource inflow to, or outflow from, a recipe process. */
export type RecipeFlowRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type RecipeFlowConnection = {|
  __typename?: 'RecipeFlowConnection',
  edges: Array<RecipeFlowEdge>,
  pageInfo: PageInfo,
|};

export type RecipeFlowCreateParams = {|
  /** (`Action`) Relates a process input or output to a verb, such as consume, produce, work, modify, etc. */
  action: $ElementType<Scalars, 'ID'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`RecipeExchange`) Relates a flow to its exchange agreement in a recipe. */
  recipeClauseOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`RecipeProcess`) Relates an input flow to its process in a recipe. */
  recipeInputOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`RecipeProcess`) Relates an output flow to its process in a recipe. */
  recipeOutputOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`ResourceSpecification`) The resource definition referenced by this flow in the recipe. */
  resourceConformsTo: $ElementType<Scalars, 'ID'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?IMeasure,
  /** (`ProcessSpecification`) References the ProcessSpecification of the last process the economic resource went through. Stage is used when the last process is important for finding proper resources, such as where the publishing process wants only documents that have gone through the editing process. */
  stage?: ?$ElementType<Scalars, 'ID'>,
  /** The state of the desired economic resource (pass or fail), after coming out of a test or review process. */
  state?: ?$ElementType<Scalars, 'String'>,
|};

export type RecipeFlowEdge = {|
  __typename?: 'RecipeFlowEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: RecipeFlow,
|};

export type RecipeFlowResponse = {|
  __typename?: 'RecipeFlowResponse',
  recipeFlow: RecipeFlow,
|};

export type RecipeFlowUpdateParams = {|
  /** (`Action`) Relates a process input or output to a verb, such as consume, produce, work, modify, etc. */
  action?: ?$ElementType<Scalars, 'ID'>,
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`RecipeExchange`) Relates a flow to its exchange agreement in a recipe. */
  recipeClauseOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`RecipeProcess`) Relates an input flow to its process in a recipe. */
  recipeInputOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`RecipeProcess`) Relates an output flow to its process in a recipe. */
  recipeOutputOf?: ?$ElementType<Scalars, 'ID'>,
  /** (`ResourceSpecification`) The resource definition referenced by this flow in the recipe. */
  resourceConformsTo?: ?$ElementType<Scalars, 'ID'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?IMeasure,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** (`ProcessSpecification`) References the ProcessSpecification of the last process the economic resource went through. Stage is used when the last process is important for finding proper resources, such as where the publishing process wants only documents that have gone through the editing process. */
  stage?: ?$ElementType<Scalars, 'ID'>,
  /** The state of the desired economic resource (pass or fail), after coming out of a test or review process. */
  state?: ?$ElementType<Scalars, 'String'>,
|};

/** Specifies a process in a recipe for use in planning from recipe. */
export type RecipeProcess = {|
  __typename?: 'RecipeProcess',
  /** Recipe process or definition that this process is based on. */
  basedOn?: ?RecipeProcess,
  /** The planned calendar duration of the process as defined for the recipe batch. */
  hasDuration?: ?Duration,
  id: $ElementType<Scalars, 'ID'>,
  meta: RecordMeta,
  /** An informal or formal textual identifier for a recipe process. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization. */
  processClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** The standard specification or definition of a process. */
  processConformsTo?: ?ProcessSpecification,
  revision?: ?RecipeProcess,
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** Specifies a process in a recipe for use in planning from recipe. */
export type RecipeProcessRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type RecipeProcessConnection = {|
  __typename?: 'RecipeProcessConnection',
  edges: Array<RecipeProcessEdge>,
  pageInfo: PageInfo,
|};

export type RecipeProcessCreateParams = {|
  /** (`RecipeProcess`) Recipe process or definition that this process is based on. */
  basedOn?: ?$ElementType<Scalars, 'ID'>,
  /** The planned calendar duration of the process as defined for the recipe batch. */
  hasDuration?: ?IDuration,
  /** An informal or formal textual identifier for a recipe process. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization. */
  processClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`ProcessSpecification`) The standard specification or definition of a process. */
  processConformsTo?: ?$ElementType<Scalars, 'ID'>,
|};

export type RecipeProcessEdge = {|
  __typename?: 'RecipeProcessEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: RecipeProcess,
|};

export type RecipeProcessResponse = {|
  __typename?: 'RecipeProcessResponse',
  recipeProcess: RecipeProcess,
|};

export type RecipeProcessUpdateParams = {|
  /** (`RecipeProcess`) Recipe process or definition that this process is based on. */
  basedOn?: ?$ElementType<Scalars, 'ID'>,
  /** The planned calendar duration of the process as defined for the recipe batch. */
  hasDuration?: ?IDuration,
  /** An informal or formal textual identifier for a recipe process. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization. */
  processClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** (`ProcessSpecification`) The standard specification or definition of a process. */
  processConformsTo?: ?$ElementType<Scalars, 'ID'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type RecordMeta = {|
  __typename?: 'RecordMeta',
  /** Number of newer revisions, if known. */
  futureRevisionsCount?: ?$ElementType<Scalars, 'Int'>,
  /** Metadata regarding the most recent revision of this record, if able to be determined. */
  latestRevision?: ?Revision,
  /** Metadata about the previous revision of this record, queryable via `revision(previousRevision.id)`. If this is the first revision of a record, this field is empty. */
  previousRevision?: ?Revision,
  /** Number of older revisions, if known. */
  previousRevisionsCount?: ?$ElementType<Scalars, 'Int'>,
  /** Metadata regarding the requested revision of this record. A record's `retrievedRevision.id` == `revisionId`. */
  retrievedRevision: Revision,
|};

/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecification = {|
  __typename?: 'ResourceSpecification',
  claims?: ?ClaimConnection,
  commitments?: ?CommitmentConnection,
  conformingResources?: ?EconomicResourceConnection,
  /** The default unit used for use or work. */
  defaultUnitOfEffort?: ?Unit,
  /** The default unit used for the resource itself. */
  defaultUnitOfResource?: ?Unit,
  economicEvents?: ?EconomicEventConnection,
  id: $ElementType<Scalars, 'ID'>,
  /** The uri to an image relevant to the entity, such as a photo, diagram, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** URI addresses to images relevant to the type of resource. */
  imageList?: ?Array<$ElementType<Scalars, 'URI'>>,
  intents?: ?IntentConnection,
  meta: RecordMeta,
  /** An informal or formal textual identifier for a type of resource. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  revision?: ?ResourceSpecification,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** Defines if any resource of that type can be freely substituted for any other resource of that type when used, consumed, traded, etc. */
  substitutable?: ?$ElementType<Scalars, 'Boolean'>,
|};


/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecificationClaimsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecificationCommitmentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecificationConformingResourcesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecificationEconomicEventsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecificationIntentsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecificationRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type ResourceSpecificationConnection = {|
  __typename?: 'ResourceSpecificationConnection',
  edges: Array<ResourceSpecificationEdge>,
  pageInfo: PageInfo,
|};

export type ResourceSpecificationCreateParams = {|
  /** (`Unit`) The default unit used for use or work. */
  defaultUnitOfEffort?: ?$ElementType<Scalars, 'ID'>,
  /** (`Unit`) The default unit used for the resource itself. */
  defaultUnitOfResource?: ?$ElementType<Scalars, 'ID'>,
  /** The uri to an image relevant to the entity, such as a photo, diagram, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** URI addresses to images relevant to the type of resource. */
  imageList?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** An informal or formal textual identifier for a type of resource. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** Defines if any resource of that type can be freely substituted for any other resource of that type when used, consumed, traded, etc. */
  substitutable?: ?$ElementType<Scalars, 'Boolean'>,
|};

export type ResourceSpecificationEdge = {|
  __typename?: 'ResourceSpecificationEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: ResourceSpecification,
|};

export type ResourceSpecificationResponse = {|
  __typename?: 'ResourceSpecificationResponse',
  resourceSpecification: ResourceSpecification,
|};

export type ResourceSpecificationUpdateParams = {|
  /** (`Unit`) The default unit used for use or work. */
  defaultUnitOfEffort?: ?$ElementType<Scalars, 'ID'>,
  /** (`Unit`) The default unit used for the resource itself. */
  defaultUnitOfResource?: ?$ElementType<Scalars, 'ID'>,
  /** The uri to an image relevant to the entity, such as a photo, diagram, etc. */
  image?: ?$ElementType<Scalars, 'URI'>,
  /** URI addresses to images relevant to the type of resource. */
  imageList?: ?Array<$ElementType<Scalars, 'URI'>>,
  /** An informal or formal textual identifier for a type of resource. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: ?Array<$ElementType<Scalars, 'URI'>>,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** Defines if any resource of that type can be freely substituted for any other resource of that type when used, consumed, traded, etc. */
  substitutable?: ?$ElementType<Scalars, 'Boolean'>,
|};

export type Revision = {|
  __typename?: 'Revision',
  /** The authoring `Agent` who created this revision. */
  author?: ?Agent,
  /** ID of the revision, used to query a specific version of the related record. */
  id: $ElementType<Scalars, 'ID'>,
  /** Time this revision was created, if known. */
  time?: ?$ElementType<Scalars, 'DateTime'>,
|};

/** Represents many-to-many relationships between intents and commitments or events that partially or full satisfy one or more intents. */
export type Satisfaction = {|
  __typename?: 'Satisfaction',
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?Measure,
  id: $ElementType<Scalars, 'ID'>,
  meta: RecordMeta,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?Measure,
  revision?: ?Satisfaction,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** A commitment or economic event fully or partially satisfying an intent. */
  satisfiedBy: EventOrCommitment,
  /** An intent satisfied fully or partially by an economic event or commitment. */
  satisfies: Intent,
|};


/** Represents many-to-many relationships between intents and commitments or events that partially or full satisfy one or more intents. */
export type SatisfactionRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type SatisfactionConnection = {|
  __typename?: 'SatisfactionConnection',
  edges: Array<SatisfactionEdge>,
  pageInfo: PageInfo,
|};

export type SatisfactionCreateParams = {|
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?IMeasure,
  /** (`Commitment`|`EconomicEvent`) A commitment or economic event fully or partially satisfying an intent. */
  satisfiedBy: $ElementType<Scalars, 'ID'>,
  /** (`Intent`) An intent satisfied fully or partially by an economic event or commitment. */
  satisfies: $ElementType<Scalars, 'ID'>,
|};

export type SatisfactionEdge = {|
  __typename?: 'SatisfactionEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Satisfaction,
|};

export type SatisfactionFilterParams = {|
  /** Match Satisfactions satisfied by any of the given EconomicEvents or Commitments */
  satisfiedBy?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** Match Satisfactions satisfying any of the given Intents */
  satisfies?: ?Array<$ElementType<Scalars, 'ID'>>,
|};

export type SatisfactionResponse = {|
  __typename?: 'SatisfactionResponse',
  satisfaction: Satisfaction,
|};

export type SatisfactionUpdateParams = {|
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?IMeasure,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** (`Commitment`|`EconomicEvent`) A commitment or economic event fully or partially satisfying an intent. */
  satisfiedBy?: ?$ElementType<Scalars, 'ID'>,
  /** (`Intent`) An intent satisfied fully or partially by an economic event or commitment. */
  satisfies?: ?$ElementType<Scalars, 'ID'>,
|};

/** An estimated or analytical logical collection of higher level processes used for budgeting, analysis, plan refinement, etc. */
export type Scenario = {|
  __typename?: 'Scenario',
  /** The scenario definition for this scenario, for example yearly budget. */
  definedAs?: ?ScenarioDefinition,
  /** The beginning date/time of the scenario, often the beginning of an accounting period. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The ending date/time of the scenario, often the end of an accounting period. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  id: $ElementType<Scalars, 'ID'>,
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<AccountingScope>,
  meta: RecordMeta,
  /** An informal or formal textual identifier for a scenario. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  plans?: ?Array<Plan>,
  processes?: ?ProcessConnection,
  /** This scenario refines another scenario, often as time moves closer or for more detail. */
  refinementOf?: ?Scenario,
  refinements?: ?Array<Scenario>,
  revision?: ?Scenario,
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** An estimated or analytical logical collection of higher level processes used for budgeting, analysis, plan refinement, etc. */
export type ScenarioProcessesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** An estimated or analytical logical collection of higher level processes used for budgeting, analysis, plan refinement, etc. */
export type ScenarioRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type ScenarioConnection = {|
  __typename?: 'ScenarioConnection',
  edges: Array<ScenarioEdge>,
  pageInfo: PageInfo,
|};

export type ScenarioCreateParams = {|
  /** (`ScenarioDefinition`) The scenario definition for this scenario, for example yearly budget. */
  definedAs?: ?$ElementType<Scalars, 'ID'>,
  /** The beginning date/time of the scenario, often the beginning of an accounting period. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The ending date/time of the scenario, often the end of an accounting period. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** An informal or formal textual identifier for a scenario. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Scenario`) This scenario refines another scenario, often as time moves closer or for more detail. */
  refinementOf?: ?$ElementType<Scalars, 'ID'>,
|};

/** The type definition of one or more scenarios, such as Yearly Budget. */
export type ScenarioDefinition = {|
  __typename?: 'ScenarioDefinition',
  /** The duration of the scenario, often an accounting period. */
  hasDuration?: ?Duration,
  id: $ElementType<Scalars, 'ID'>,
  meta: RecordMeta,
  /** An informal or formal textual identifier for a scenario definition. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revision?: ?ScenarioDefinition,
  revisionId: $ElementType<Scalars, 'ID'>,
  scenarios?: ?ScenarioConnection,
|};


/** The type definition of one or more scenarios, such as Yearly Budget. */
export type ScenarioDefinitionRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** The type definition of one or more scenarios, such as Yearly Budget. */
export type ScenarioDefinitionScenariosArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};

export type ScenarioDefinitionConnection = {|
  __typename?: 'ScenarioDefinitionConnection',
  edges: Array<ScenarioDefinitionEdge>,
  pageInfo: PageInfo,
|};

export type ScenarioDefinitionCreateParams = {|
  /** The duration of the scenario, often an accounting period. */
  hasDuration?: ?IDuration,
  /** An informal or formal textual identifier for a scenario definition. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
|};

export type ScenarioDefinitionEdge = {|
  __typename?: 'ScenarioDefinitionEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: ScenarioDefinition,
|};

export type ScenarioDefinitionResponse = {|
  __typename?: 'ScenarioDefinitionResponse',
  scenarioDefinition: ScenarioDefinition,
|};

export type ScenarioDefinitionUpdateParams = {|
  /** The duration of the scenario, often an accounting period. */
  hasDuration?: ?IDuration,
  /** An informal or formal textual identifier for a scenario definition. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type ScenarioEdge = {|
  __typename?: 'ScenarioEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Scenario,
|};

export type ScenarioResponse = {|
  __typename?: 'ScenarioResponse',
  scenario: Scenario,
|};

export type ScenarioUpdateParams = {|
  /** (`ScenarioDefinition`) The scenario definition for this scenario, for example yearly budget. */
  definedAs?: ?$ElementType<Scalars, 'ID'>,
  /** The beginning date/time of the scenario, often the beginning of an accounting period. */
  hasBeginning?: ?$ElementType<Scalars, 'DateTime'>,
  /** The ending date/time of the scenario, often the end of an accounting period. */
  hasEnd?: ?$ElementType<Scalars, 'DateTime'>,
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: ?Array<$ElementType<Scalars, 'ID'>>,
  /** An informal or formal textual identifier for a scenario. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** (`Scenario`) This scenario refines another scenario, often as time moves closer or for more detail. */
  refinementOf?: ?$ElementType<Scalars, 'ID'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

/** Represents many-to-many relationships between claim and economic events that fully or partially settle one or more claims. */
export type Settlement = {|
  __typename?: 'Settlement',
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?Measure,
  id: $ElementType<Scalars, 'ID'>,
  meta: RecordMeta,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?Measure,
  revision?: ?Settlement,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** The economic event fully or partially settling a claim. */
  settledBy: EconomicEvent,
  /** A claim which is fully or partially settled by an economic event. */
  settles: Claim,
|};


/** Represents many-to-many relationships between claim and economic events that fully or partially settle one or more claims. */
export type SettlementRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type SettlementConnection = {|
  __typename?: 'SettlementConnection',
  edges: Array<SettlementEdge>,
  pageInfo: PageInfo,
|};

export type SettlementCreateParams = {|
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?IMeasure,
  /** (`EconomicEvent`) The economic event fully or partially settling a claim. */
  settledBy: $ElementType<Scalars, 'ID'>,
  /** (`Claim`) A claim which is fully or partially settled by an economic event. */
  settles: $ElementType<Scalars, 'ID'>,
|};

export type SettlementEdge = {|
  __typename?: 'SettlementEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Settlement,
|};

export type SettlementResponse = {|
  __typename?: 'SettlementResponse',
  settlement: Settlement,
|};

export type SettlementUpdateParams = {|
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: ?IMeasure,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: ?IMeasure,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** (`EconomicEvent`) The economic event fully or partially settling a claim. */
  settledBy?: ?$ElementType<Scalars, 'ID'>,
  /** (`Claim`) A claim which is fully or partially settled by an economic event. */
  settles?: ?$ElementType<Scalars, 'ID'>,
|};

export const SortValues = Object.freeze({
  Asc: 'asc',
  Desc: 'desc'
});


export type Sort = $Values<typeof SortValues>;

/** A physical mappable location. */
export type SpatialThing = {|
  __typename?: 'SpatialThing',
  agents?: ?Array<Agent>,
  /** Altitude. */
  alt?: ?$ElementType<Scalars, 'Decimal'>,
  commitments?: ?Array<Commitment>,
  economicEvents?: ?EconomicEventConnection,
  economicResources?: ?EconomicResourceConnection,
  id: $ElementType<Scalars, 'ID'>,
  intents?: ?Array<Intent>,
  /** Latitude. */
  lat?: ?$ElementType<Scalars, 'Decimal'>,
  /** Longitude. */
  long?: ?$ElementType<Scalars, 'Decimal'>,
  /** An address that will be recognized as mappable by mapping software. */
  mappableAddress?: ?$ElementType<Scalars, 'String'>,
  meta: RecordMeta,
  /** An informal or formal textual identifier for a location. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revision?: ?SpatialThing,
  revisionId: $ElementType<Scalars, 'ID'>,
|};


/** A physical mappable location. */
export type SpatialThingEconomicEventsArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A physical mappable location. */
export type SpatialThingEconomicResourcesArgs = {|
  after?: ?$ElementType<Scalars, 'String'>,
  before?: ?$ElementType<Scalars, 'String'>,
  first?: ?$ElementType<Scalars, 'Int'>,
  last?: ?$ElementType<Scalars, 'Int'>,
|};


/** A physical mappable location. */
export type SpatialThingRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type SpatialThingConnection = {|
  __typename?: 'SpatialThingConnection',
  edges: Array<SpatialThingEdge>,
  pageInfo: PageInfo,
|};

export type SpatialThingCreateParams = {|
  /** Altitude. */
  alt?: ?$ElementType<Scalars, 'Decimal'>,
  /** Latitude. */
  lat?: ?$ElementType<Scalars, 'Decimal'>,
  /** Longitude. */
  long?: ?$ElementType<Scalars, 'Decimal'>,
  /** An address that will be recognized as mappable by mapping software. */
  mappableAddress?: ?$ElementType<Scalars, 'String'>,
  /** An informal or formal textual identifier for a location. Does not imply uniqueness. */
  name: $ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
|};

export type SpatialThingEdge = {|
  __typename?: 'SpatialThingEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: SpatialThing,
|};

export type SpatialThingResponse = {|
  __typename?: 'SpatialThingResponse',
  spatialThing: SpatialThing,
|};

export type SpatialThingUpdateParams = {|
  /** Altitude. */
  alt?: ?$ElementType<Scalars, 'Decimal'>,
  /** Latitude. */
  lat?: ?$ElementType<Scalars, 'Decimal'>,
  /** Longitude. */
  long?: ?$ElementType<Scalars, 'Decimal'>,
  /** An address that will be recognized as mappable by mapping software. */
  mappableAddress?: ?$ElementType<Scalars, 'String'>,
  /** An informal or formal textual identifier for a location. Does not imply uniqueness. */
  name?: ?$ElementType<Scalars, 'String'>,
  /** A textual description or comment. */
  note?: ?$ElementType<Scalars, 'String'>,
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export const TimeUnitValues = Object.freeze({
  Day: 'day',
  Hour: 'hour',
  Minute: 'minute',
  Month: 'month',
  Second: 'second',
  Week: 'week',
  Year: 'year'
});


/** Defines the unit of time measured in a temporal `Duration`. */
export type TimeUnit = $Values<typeof TimeUnitValues>;

export type TrackTraceItem = EconomicEvent | EconomicResource | Process;


/**
 * Defines a unit of measurement, along with its display symbol.
 * From OM2 vocabulary.
 */
export type Unit = {|
  __typename?: 'Unit',
  id: $ElementType<Scalars, 'ID'>,
  /** A human readable label for the unit, can be language specific. */
  label: $ElementType<Scalars, 'String'>,
  meta: RecordMeta,
  revision?: ?Unit,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** A standard display symbol for a unit of measure. */
  symbol: $ElementType<Scalars, 'String'>,
|};


/**
 * Defines a unit of measurement, along with its display symbol.
 * From OM2 vocabulary.
 */
export type UnitRevisionArgs = {|
  revisionId: $ElementType<Scalars, 'ID'>,
|};

export type UnitConnection = {|
  __typename?: 'UnitConnection',
  edges: Array<UnitEdge>,
  pageInfo: PageInfo,
|};

export type UnitCreateParams = {|
  /** A human readable label for the unit, can be language specific. */
  label: $ElementType<Scalars, 'String'>,
  /** A standard display symbol for a unit of measure. */
  symbol: $ElementType<Scalars, 'String'>,
|};

export type UnitEdge = {|
  __typename?: 'UnitEdge',
  cursor: $ElementType<Scalars, 'String'>,
  node: Unit,
|};

export type UnitResponse = {|
  __typename?: 'UnitResponse',
  unit: Unit,
|};

export type UnitUpdateParams = {|
  /** A human readable label for the unit, can be language specific. */
  label?: ?$ElementType<Scalars, 'String'>,
  revisionId: $ElementType<Scalars, 'ID'>,
  /** A standard display symbol for a unit of measure. */
  symbol?: ?$ElementType<Scalars, 'String'>,
|};


/** Query parameters for reading `Proposal`s related to an `Agent` */
export type AgentProposalSearchParams = {|
  searchString?: ?$ElementType<Scalars, 'String'>,
|};
