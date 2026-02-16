export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /**
   * The `DateTime` scalar type represents a DateTime value as specified by
   * [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601).
   */
  DateTime: Date;
  /**
   * The `Decimal` scalar type represents arbitrary-precision floating-point
   * numbers as specified by
   * [IEEE 854-1987](https://en.wikipedia.org/wiki/IEEE_854-1987).  They
   * are represented as strings.
   */
  Decimal: any;
  /** The `URI` type simply declares a reference to an external web URL, Holochain entry or other resource. */
  URI: string;
  /** Filtering module stub */
  _vf_filtering_dummy: any;
};

/** A boundary or context grouped around some other record- used for documenting, accounting, planning. */
export type AccountingScope = Organization | Person;

/**
 * An action verb defining the kind of event, commitment, or intent.
 * It is recommended that the lowercase action verb should be used as the record ID
 * in order that references to `Action`s elsewhere in the system are easily readable.
 */
export type Action = {
  __typename?: 'Action';
  id: Scalars['ID'];
  /** Denotes if a process input or output, or not related to a process. */
  inputOutput?: Maybe<Scalars['String']>;
  /** A unique verb which defines the action. */
  label: Scalars['String'];
  /** The onhand effect of an economic event on a resource, increment, decrement, no effect, or decrement resource and increment 'to' resource. */
  onhandEffect: Scalars['String'];
  /** The action that should be included on the other direction of the process, for example accept with modify. */
  pairsWith?: Maybe<Scalars['String']>;
  /** The accounting effect of an economic event on a resource, increment, decrement, no effect, or decrement resource and increment 'to' resource. */
  resourceEffect: Scalars['String'];
};

/** A person or group or organization with economic agency. */
export type Agent = {
  claims?: Maybe<IntentConnection>;
  claimsAsProvider?: Maybe<IntentConnection>;
  claimsAsReceiver?: Maybe<IntentConnection>;
  claimsInScope?: Maybe<IntentConnection>;
  commitments?: Maybe<CommitmentConnection>;
  commitmentsAsProvider?: Maybe<CommitmentConnection>;
  commitmentsAsReceiver?: Maybe<CommitmentConnection>;
  commitmentsInScope?: Maybe<CommitmentConnection>;
  economicEvents?: Maybe<EconomicEventConnection>;
  economicEventsAsProvider?: Maybe<EconomicEventConnection>;
  economicEventsAsReceiver?: Maybe<EconomicEventConnection>;
  economicEventsInScope?: Maybe<EconomicEventConnection>;
  id: Scalars['ID'];
  /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: Maybe<Scalars['URI']>;
  intents?: Maybe<IntentConnection>;
  intentsAsProvider?: Maybe<IntentConnection>;
  intentsAsReceiver?: Maybe<IntentConnection>;
  intentsInScope?: Maybe<IntentConnection>;
  inventoriedEconomicResources?: Maybe<EconomicResourceConnection>;
  meta: RecordMeta;
  /** An informal or formal textual identifier for an agent. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  plans?: Maybe<PlanConnection>;
  /** The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: Maybe<SpatialThing>;
  processes?: Maybe<ProcessConnection>;
  proposals?: Maybe<ProposalConnection>;
  proposalsInScope?: Maybe<ProposalConnection>;
  proposalsTo?: Maybe<ProposalConnection>;
  relationships?: Maybe<AgentRelationshipConnection>;
  relationshipsAsObject?: Maybe<AgentRelationshipConnection>;
  relationshipsAsSubject?: Maybe<AgentRelationshipConnection>;
  revision?: Maybe<Agent>;
  revisionId: Scalars['ID'];
  roles?: Maybe<Array<AgentRelationshipRole>>;
  scenariosInScope?: Maybe<ScenarioConnection>;
};


/** A person or group or organization with economic agency. */
export type AgentClaimsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentClaimsAsProviderArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentClaimsAsReceiverArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentClaimsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentCommitmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentCommitmentFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentCommitmentsAsProviderArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentCommitmentsAsReceiverArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentCommitmentsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentEconomicEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentEventFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentEconomicEventsAsProviderArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentEconomicEventsAsReceiverArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentEconomicEventsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentIntentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentIntentFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentIntentsAsProviderArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentIntentsAsReceiverArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentIntentsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentInventoriedEconomicResourcesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentResourceFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentPlansArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentPlanFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentProcessesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentProcessFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentProposalsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentProposalSearchParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentProposalsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentProposalsToArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentRelationshipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentRelationshipFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentRelationshipsAsObjectArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentRelationshipFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentRelationshipsAsSubjectArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentRelationshipFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A person or group or organization with economic agency. */
export type AgentRevisionArgs = {
  revisionId: Scalars['ID'];
};


/** A person or group or organization with economic agency. */
export type AgentScenariosInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Query parameters for reading `Commitment`s related to an `Agent` */
export type AgentCommitmentFilterParams = {
  action?: InputMaybe<Scalars['ID']>;
  endDate?: InputMaybe<Scalars['DateTime']>;
  finished?: InputMaybe<Scalars['Boolean']>;
  searchString?: InputMaybe<Scalars['String']>;
  startDate?: InputMaybe<Scalars['DateTime']>;
};

export type AgentConnection = {
  __typename?: 'AgentConnection';
  edges: Array<AgentEdge>;
  pageInfo: PageInfo;
};

export type AgentCreateParams = {
  /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: InputMaybe<Scalars['URI']>;
  /** An informal or formal textual identifier for an agent. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`SpatialThing`) The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: InputMaybe<Scalars['ID']>;
};

export type AgentEdge = {
  __typename?: 'AgentEdge';
  cursor: Scalars['String'];
  node: Agent;
};

/** Query parameters for reading `EconomicEvent`s related to an `Agent` */
export type AgentEventFilterParams = {
  action?: InputMaybe<Scalars['ID']>;
  endDate?: InputMaybe<Scalars['DateTime']>;
  searchString?: InputMaybe<Scalars['String']>;
  startDate?: InputMaybe<Scalars['DateTime']>;
};

export type AgentFilterParams = {
  /** Retrieve only agents with the specified classification(s). */
  classifiedAs?: InputMaybe<Array<Scalars['ID']>>;
};

/** Query parameters for reading `Intent`s related to an `Agent` */
export type AgentIntentFilterParams = {
  action?: InputMaybe<Scalars['ID']>;
  endDate?: InputMaybe<Scalars['DateTime']>;
  finished?: InputMaybe<Scalars['Boolean']>;
  searchString?: InputMaybe<Scalars['String']>;
  startDate?: InputMaybe<Scalars['DateTime']>;
};

/** Query parameters for reading `Plan`s related to an `Agent` */
export type AgentPlanFilterParams = {
  finished?: InputMaybe<Scalars['Boolean']>;
  searchString?: InputMaybe<Scalars['String']>;
};

/** Query parameters for reading `Process`es related to an `Agent` */
export type AgentProcessFilterParams = {
  finished?: InputMaybe<Scalars['Boolean']>;
  searchString?: InputMaybe<Scalars['String']>;
};

/** The role of an economic relationship that exists between 2 agents, such as member, trading partner. */
export type AgentRelationship = {
  __typename?: 'AgentRelationship';
  id: Scalars['ID'];
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: Maybe<Array<AccountingScope>>;
  meta: RecordMeta;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  /** The object of a relationship between 2 agents.  For example, if Mary is a member of a group, then the group is the object. */
  object: Agent;
  /** A kind of relationship that exists between 2 agents. */
  relationship: AgentRelationshipRole;
  revision?: Maybe<AgentRelationship>;
  revisionId: Scalars['ID'];
  /** The subject of a relationship between 2 agents.  For example, if Mary is a member of a group, then Mary is the subject. */
  subject: Agent;
};


/** The role of an economic relationship that exists between 2 agents, such as member, trading partner. */
export type AgentRelationshipRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type AgentRelationshipConnection = {
  __typename?: 'AgentRelationshipConnection';
  edges: Array<AgentRelationshipEdge>;
  pageInfo: PageInfo;
};

export type AgentRelationshipCreateParams = {
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Agent`) The object of a relationship between 2 agents.  For example, if Mary is a member of a group, then the group is the object. */
  object: Scalars['ID'];
  /** (`AgentRelationshipRole`) The role of an economic relationship that exists between 2 agents, such as member, trading partner. */
  relationship: Scalars['ID'];
  /** (`Agent`) The subject of a relationship between 2 agents.  For example, if Mary is a member of a group, then Mary is the subject. */
  subject: Scalars['ID'];
};

export type AgentRelationshipEdge = {
  __typename?: 'AgentRelationshipEdge';
  cursor: Scalars['String'];
  node: AgentRelationship;
};

export type AgentRelationshipFilterParams = {
  /** Retrieve only relationships relevant in the given accounting scope(s). */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** Retrieve only relationships matching these AgentRelationshipRole(s). */
  roleId?: InputMaybe<Array<Scalars['ID']>>;
};

export type AgentRelationshipResponse = {
  __typename?: 'AgentRelationshipResponse';
  agentRelationship: AgentRelationship;
};

/** A relationship role defining the kind of association one agent can have with another. */
export type AgentRelationshipRole = {
  __typename?: 'AgentRelationshipRole';
  agentRelationships?: Maybe<AgentRelationshipConnection>;
  id: Scalars['ID'];
  /** The human readable name of the role, from the object to the subject. */
  inverseRoleLabel?: Maybe<Scalars['String']>;
  meta: RecordMeta;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  revision?: Maybe<AgentRelationshipRole>;
  revisionId: Scalars['ID'];
  /** The human readable name of the role, from the subject to the object. */
  roleLabel: Scalars['String'];
};


/** A relationship role defining the kind of association one agent can have with another. */
export type AgentRelationshipRoleAgentRelationshipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A relationship role defining the kind of association one agent can have with another. */
export type AgentRelationshipRoleRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type AgentRelationshipRoleConnection = {
  __typename?: 'AgentRelationshipRoleConnection';
  edges: Array<AgentRelationshipRoleEdge>;
  pageInfo: PageInfo;
};

export type AgentRelationshipRoleCreateParams = {
  /** The human readable name of the role, inverse from the object to the subject. For example, 'has member'. */
  inverseRoleLabel?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** The human readable name of the role, inverse from the object to the subject. For example, 'is member of'. */
  roleLabel: Scalars['String'];
};

export type AgentRelationshipRoleEdge = {
  __typename?: 'AgentRelationshipRoleEdge';
  cursor: Scalars['String'];
  node: AgentRelationshipRole;
};

export type AgentRelationshipRoleResponse = {
  __typename?: 'AgentRelationshipRoleResponse';
  agentRelationshipRole?: Maybe<AgentRelationshipRole>;
};

export type AgentRelationshipRoleUpdateParams = {
  /** The human readable name of the role, inverse from the object to the subject. For example, 'has member'. */
  inverseRoleLabel?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  revisionId: Scalars['ID'];
  /** The human readable name of the role, inverse from the object to the subject. For example, 'is member of'. */
  roleLabel?: InputMaybe<Scalars['String']>;
};

export type AgentRelationshipUpdateParams = {
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Agent`) The object of a relationship between 2 agents.  For example, if Mary is a member of a group, then the group is the object. */
  object?: InputMaybe<Scalars['ID']>;
  /** (`AgentRelationshipRole`) The role of an economic relationship that exists between 2 agents, such as member, trading partner. */
  relationship?: InputMaybe<Scalars['ID']>;
  revisionId: Scalars['ID'];
  /** (`Agent`) The subject of a relationship between 2 agents.  For example, if Mary is a member of a group, then Mary is the subject. */
  subject?: InputMaybe<Scalars['ID']>;
};

/** Query parameters for reading `EconomicResource`s related to an `Agent` */
export type AgentResourceFilterParams = {
  page?: InputMaybe<Scalars['Int']>;
  resourceClassification?: InputMaybe<Scalars['URI']>;
  searchString?: InputMaybe<Scalars['String']>;
};

export type AgentUpdateParams = {
  /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: InputMaybe<Scalars['URI']>;
  /** An informal or formal textual identifier for an agent. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`SpatialThing`) The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: InputMaybe<Scalars['ID']>;
  revisionId: Scalars['ID'];
};

/** Any type of agreement among economic agents. */
export type Agreement = {
  __typename?: 'Agreement';
  commitments?: Maybe<Array<Commitment>>;
  /** The date and time the agreement was created. */
  created?: Maybe<Scalars['DateTime']>;
  economicEvents?: Maybe<Array<EconomicEvent>>;
  id: Scalars['ID'];
  involvedAgents?: Maybe<AgentConnection>;
  meta: RecordMeta;
  /** An informal or formal textual identifier for an agreement. Does not imply uniqueness. */
  name?: Maybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  revision?: Maybe<Agreement>;
  revisionId: Scalars['ID'];
  unplannedEconomicEvents?: Maybe<Array<EconomicEvent>>;
};


/** Any type of agreement among economic agents. */
export type AgreementInvolvedAgentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Any type of agreement among economic agents. */
export type AgreementRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type AgreementConnection = {
  __typename?: 'AgreementConnection';
  edges: Array<AgreementEdge>;
  pageInfo: PageInfo;
};

export type AgreementCreateParams = {
  /** The date and time the agreement was created. */
  created?: InputMaybe<Scalars['DateTime']>;
  /** An informal or formal textual identifier for an agreement. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
};

export type AgreementEdge = {
  __typename?: 'AgreementEdge';
  cursor: Scalars['String'];
  node: Agreement;
};

export type AgreementResponse = {
  __typename?: 'AgreementResponse';
  agreement: Agreement;
};

export type AgreementUpdateParams = {
  /** The date and time the agreement was created. */
  created?: InputMaybe<Scalars['DateTime']>;
  /** An informal or formal textual identifier for an agreement. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  revisionId: Scalars['ID'];
};

/**
 * A way to tie an economic event that is given in loose fulfilment for another economic event, without commitments or expectations.
 * Supports the gift economy.
 */
export type Appreciation = {
  __typename?: 'Appreciation';
  /** The agent who is appreciating. */
  appreciatedBy?: Maybe<Agent>;
  /** The economic event this appreciation has been given in acknowledgement of. */
  appreciationOf: EconomicEvent;
  /** The economic event provided as a gift in this appreciation. */
  appreciationWith: EconomicEvent;
  id: Scalars['ID'];
  meta: RecordMeta;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  revision?: Maybe<Appreciation>;
  revisionId: Scalars['ID'];
};


/**
 * A way to tie an economic event that is given in loose fulfilment for another economic event, without commitments or expectations.
 * Supports the gift economy.
 */
export type AppreciationRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type AppreciationConnection = {
  __typename?: 'AppreciationConnection';
  edges: Array<AppreciationEdge>;
  pageInfo: PageInfo;
};

export type AppreciationCreateParams = {
  /** (`Agent`) The agent who is appreciating. */
  appreciatedBy?: InputMaybe<Scalars['ID']>;
  /** (`EconomicEvent`) The economic event this appreciation has been given in acknowledgement of. */
  appreciationOf: Scalars['ID'];
  /** (`EconomicEvent`) The economic event provided as a gift in this appreciation. */
  appreciationWith: Scalars['ID'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
};

export type AppreciationEdge = {
  __typename?: 'AppreciationEdge';
  cursor: Scalars['String'];
  node: Appreciation;
};

export type AppreciationResponse = {
  __typename?: 'AppreciationResponse';
  appreciation: Appreciation;
};

export type AppreciationUpdateParams = {
  /** (`EconomicEvent`) The economic event this appreciation has been given in acknowledgement of. */
  appreciationOf?: InputMaybe<Scalars['ID']>;
  /** (`EconomicEvent`) The economic event provided as a gift in this appreciation. */
  appreciationWith?: InputMaybe<Scalars['ID']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  revisionId: Scalars['ID'];
};

/** A claim for a future economic event(s) in reciprocity for an economic event that already occurred. For example, a claim for payment for goods received. */
export type Claim = {
  __typename?: 'Claim';
  /** Relates a claim to a verb, such as consume, produce, work, improve, etc. */
  action: Action;
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this claim. */
  agreedIn?: Maybe<Scalars['URI']>;
  /** The data on which the claim was made. */
  created?: Maybe<Scalars['DateTime']>;
  /** The time the claim is expected to be settled. */
  due?: Maybe<Scalars['DateTime']>;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: Maybe<Measure>;
  /** The claim is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: Maybe<Array<AccountingScope>>;
  meta: RecordMeta;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  /** The economic agent from whom the claim is expected. */
  provider?: Maybe<Agent>;
  /** The economic agent whom the claim is for. */
  receiver?: Maybe<Agent>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: Maybe<Array<Scalars['URI']>>;
  /** The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: Maybe<ResourceSpecification>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: Maybe<Measure>;
  revision?: Maybe<Claim>;
  revisionId: Scalars['ID'];
  settledBy?: Maybe<SettlementConnection>;
  /** The economic event which already occurred which this claim has been made against. */
  triggeredBy: EconomicEvent;
};


/** A claim for a future economic event(s) in reciprocity for an economic event that already occurred. For example, a claim for payment for goods received. */
export type ClaimRevisionArgs = {
  revisionId: Scalars['ID'];
};


/** A claim for a future economic event(s) in reciprocity for an economic event that already occurred. For example, a claim for payment for goods received. */
export type ClaimSettledByArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type ClaimConnection = {
  __typename?: 'ClaimConnection';
  edges: Array<ClaimEdge>;
  pageInfo: PageInfo;
};

export type ClaimCreateParams = {
  /** (`Action`) Relates a claim to a verb, such as consume, produce, work, improve, etc. */
  action: Scalars['ID'];
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this claim. */
  agreedIn?: InputMaybe<Scalars['URI']>;
  /** The data on which the claim was made. */
  created?: InputMaybe<Scalars['DateTime']>;
  /** The time the claim is expected to be settled. */
  due?: InputMaybe<Scalars['DateTime']>;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** The claim is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: InputMaybe<Scalars['Boolean']>;
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Agent`) The economic agent from whom the claim is expected. */
  provider?: InputMaybe<Scalars['ID']>;
  /** (`Agent`) The economic agent whom the claim is for. */
  receiver?: InputMaybe<Scalars['ID']>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: InputMaybe<Scalars['ID']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  /** (`EconomicEvent`) The economic event which already occurred which this claim has been made against. */
  triggeredBy: Scalars['ID'];
};

export type ClaimEdge = {
  __typename?: 'ClaimEdge';
  cursor: Scalars['String'];
  node: Claim;
};

export type ClaimFilterParams = {
  action?: InputMaybe<Array<Scalars['ID']>>;
  endDate?: InputMaybe<Scalars['DateTime']>;
  finished?: InputMaybe<Scalars['Boolean']>;
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  providerId?: InputMaybe<Array<Scalars['ID']>>;
  receiverId?: InputMaybe<Array<Scalars['ID']>>;
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  resourceConformsTo?: InputMaybe<Array<Scalars['ID']>>;
  startDate?: InputMaybe<Scalars['DateTime']>;
};

export type ClaimResponse = {
  __typename?: 'ClaimResponse';
  claim: Claim;
};

export type ClaimUpdateParams = {
  /** (`Action`) Relates a claim to a verb, such as consume, produce, work, improve, etc. */
  action?: InputMaybe<Scalars['ID']>;
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this claim. */
  agreedIn?: InputMaybe<Scalars['URI']>;
  /** The data on which the claim was made. */
  created?: InputMaybe<Scalars['DateTime']>;
  /** The time the claim is expected to be settled. */
  due?: InputMaybe<Scalars['DateTime']>;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** The claim is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: InputMaybe<Scalars['Boolean']>;
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Agent`) The economic agent from whom the claim is expected. */
  provider?: InputMaybe<Scalars['ID']>;
  /** (`Agent`) The economic agent whom the claim is for. */
  receiver?: InputMaybe<Scalars['ID']>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: InputMaybe<Scalars['ID']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  revisionId: Scalars['ID'];
  /** (`EconomicEvent`) The economic event which already occurred which this claim has been made against. */
  triggeredBy?: InputMaybe<Scalars['ID']>;
};

/** A planned economic flow that has been promised by an agent to another agent. */
export type Commitment = {
  __typename?: 'Commitment';
  /** Relates a commitment to a verb, such as consume, produce, work, improve, etc. */
  action: Action;
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this commitment. */
  agreedIn?: Maybe<Scalars['URI']>;
  /** The place where a commitment occurs. Usually mappable. */
  atLocation?: Maybe<SpatialThing>;
  /** This commitment is part of the exchange agreement. */
  clauseOf?: Maybe<Agreement>;
  /** The creation time of the commitment. */
  created?: Maybe<Scalars['DateTime']>;
  /** The commitment can be safely deleted, has no dependent information. */
  deletable?: Maybe<Scalars['Boolean']>;
  /** The time something is expected to be complete. */
  due?: Maybe<Scalars['DateTime']>;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: Maybe<Measure>;
  /** The commitment is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: Maybe<Scalars['Boolean']>;
  /** The economic event which completely or partially fulfills a commitment. */
  fulfilledBy?: Maybe<Array<Fulfillment>>;
  /** The planned beginning of the commitment. */
  hasBeginning?: Maybe<Scalars['DateTime']>;
  /** The planned end of the commitment. */
  hasEnd?: Maybe<Scalars['DateTime']>;
  /** The planned date/time for the commitment. Can be used instead of beginning and end. */
  hasPointInTime?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: Maybe<Array<AccountingScope>>;
  /** Represents a desired deliverable expected from this plan. */
  independentDemandOf?: Maybe<Plan>;
  /** Defines the process to which this commitment is an input. */
  inputOf?: Maybe<Process>;
  involvedAgents?: Maybe<Array<Agent>>;
  meta: RecordMeta;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  /** Defines the process for which this commitment is an output. */
  outputOf?: Maybe<Process>;
  /** The transfer commitment is part of the plan. */
  plannedWithin?: Maybe<Plan>;
  /** The economic agent from whom the commitment is initiated. */
  provider: Agent;
  /** The economic agent whom the commitment is for. */
  receiver: Agent;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: Maybe<Array<Scalars['URI']>>;
  /** The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: Maybe<ResourceSpecification>;
  /** Economic resource involved in the commitment. */
  resourceInventoriedAs?: Maybe<EconomicResource>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: Maybe<Measure>;
  revision?: Maybe<Commitment>;
  revisionId: Scalars['ID'];
  /** An intent satisfied fully or partially by an economic event or commitment. */
  satisfies?: Maybe<Array<Satisfaction>>;
  /** References the ProcessSpecification of the last process the economic resource went through. Stage is used when the last process is important for finding proper resources, such as where the publishing process wants only documents that have gone through the editing process. */
  stage?: Maybe<ProcessSpecification>;
  /** Additional economic resource on the commitment when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side. */
  toResourceInventoriedAs?: Maybe<EconomicResource>;
};


/** A planned economic flow that has been promised by an agent to another agent. */
export type CommitmentRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type CommitmentConnection = {
  __typename?: 'CommitmentConnection';
  edges: Array<CommitmentEdge>;
  pageInfo: PageInfo;
};

export type CommitmentCreateParams = {
  /** (`Action`) Relates a commitment to a verb, such as consume, produce, work, improve, etc. */
  action: Scalars['ID'];
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this commitment. */
  agreedIn?: InputMaybe<Scalars['URI']>;
  /** (`SpatialThing`) The place where an commitment occurs.  Usually mappable. */
  atLocation?: InputMaybe<Scalars['ID']>;
  /** (`Agreement`) This commitment is part of the agreement. */
  clauseOf?: InputMaybe<Scalars['ID']>;
  /** The time something is expected to be complete. */
  due?: InputMaybe<Scalars['DateTime']>;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** The commitment is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: InputMaybe<Scalars['Boolean']>;
  /** The planned beginning of the commitment. */
  hasBeginning?: InputMaybe<Scalars['DateTime']>;
  /** The planned end of the commitment. */
  hasEnd?: InputMaybe<Scalars['DateTime']>;
  /** The planned date/time for the commitment. Can be used instead of beginning and end. */
  hasPointInTime?: InputMaybe<Scalars['DateTime']>;
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** (`Plan`) Represents a desired deliverable expected from this plan. */
  independentDemandOf?: InputMaybe<Scalars['ID']>;
  /** (`Process`) Defines the process to which this commitment is an input. */
  inputOf?: InputMaybe<Scalars['ID']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Process`) Defines the process for which this commitment is an output. */
  outputOf?: InputMaybe<Scalars['ID']>;
  /** (`Plan`) The transfer commitment is part of the plan. */
  plannedWithin?: InputMaybe<Scalars['ID']>;
  /** (`Agent`) The economic agent from whom the commitment is initiated. */
  provider: Scalars['ID'];
  /** (`Agent`) The economic agent whom the commitment is for. */
  receiver: Scalars['ID'];
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: InputMaybe<Scalars['ID']>;
  /** (`EconomicResource`) Economic resource involved in the commitment. */
  resourceInventoriedAs?: InputMaybe<Scalars['ID']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  /** The process stage of the commitment. */
  stage?: InputMaybe<Scalars['URI']>;
  /** (`EconomicResource`) Additional economic resource on the commitment when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side. */
  toResourceInventoriedAs?: InputMaybe<Scalars['ID']>;
};

export type CommitmentEdge = {
  __typename?: 'CommitmentEdge';
  cursor: Scalars['String'];
  node: Commitment;
};

export type CommitmentFilterParams = {
  action?: InputMaybe<Array<Scalars['ID']>>;
  endDate?: InputMaybe<Scalars['DateTime']>;
  finished?: InputMaybe<Scalars['Boolean']>;
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  providerId?: InputMaybe<Array<Scalars['ID']>>;
  receiverId?: InputMaybe<Array<Scalars['ID']>>;
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  resourceConformsTo?: InputMaybe<Array<Scalars['ID']>>;
  searchString?: InputMaybe<Scalars['String']>;
  startDate?: InputMaybe<Scalars['DateTime']>;
};

export type CommitmentResponse = {
  __typename?: 'CommitmentResponse';
  commitment: Commitment;
};

export type CommitmentUpdateParams = {
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this commitment. */
  agreedIn?: InputMaybe<Scalars['URI']>;
  /** (`SpatialThing`) The place where an commitment occurs.  Usually mappable. */
  atLocation?: InputMaybe<Scalars['ID']>;
  /** (`Agreement`) This commitment is part of the agreement. */
  clauseOf?: InputMaybe<Scalars['ID']>;
  /** The time something is expected to be complete. */
  due?: InputMaybe<Scalars['DateTime']>;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** The commitment is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: InputMaybe<Scalars['Boolean']>;
  /** The planned beginning of the commitment. */
  hasBeginning?: InputMaybe<Scalars['DateTime']>;
  /** The planned end of the commitment. */
  hasEnd?: InputMaybe<Scalars['DateTime']>;
  /** The planned date/time for the commitment. Can be used instead of beginning and end. */
  hasPointInTime?: InputMaybe<Scalars['DateTime']>;
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** (`Plan`) Represents a desired deliverable expected from this plan. */
  independentDemandOf?: InputMaybe<Scalars['ID']>;
  /** (`Process`) Defines the process to which this commitment is an input. */
  inputOf?: InputMaybe<Scalars['ID']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Process`) Defines the process for which this commitment is an output. */
  outputOf?: InputMaybe<Scalars['ID']>;
  /** (`Plan`) The transfer commitment is part of the plan. */
  plannedWithin?: InputMaybe<Scalars['ID']>;
  /** (`Agent`) The economic agent from whom the commitment is initiated. */
  provider?: InputMaybe<Scalars['ID']>;
  /** (`Agent`) The economic agent whom the commitment is for. */
  receiver?: InputMaybe<Scalars['ID']>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: InputMaybe<Scalars['ID']>;
  /** (`EconomicResource`) Economic resource involved in the commitment. */
  resourceInventoriedAs?: InputMaybe<Scalars['ID']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  revisionId: Scalars['ID'];
  /** The process stage of the commitment. */
  stage?: InputMaybe<Scalars['URI']>;
  /** (`EconomicResource`) Additional economic resource on the commitment when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side. */
  toResourceInventoriedAs?: InputMaybe<Scalars['ID']>;
};

/** A `Duration` represents an interval between two `DateTime` values. */
export type Duration = {
  __typename?: 'Duration';
  /** A number representing the duration, will be paired with a unit. */
  numericDuration: Scalars['Decimal'];
  /** A unit of measure. */
  unitType: TimeUnit;
};

/** An observed economic flow, as opposed to a flow planned to happen in the future. This could reflect a change in the quantity of an economic resource. It is also defined by its behavior in relation to the economic resource (see `Action`) */
export type EconomicEvent = {
  __typename?: 'EconomicEvent';
  /** Relates an economic event to a verb, such as consume, produce, work, improve, etc. */
  action: Action;
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this economic event. */
  agreedIn?: Maybe<Scalars['URI']>;
  appreciationOf?: Maybe<Array<Appreciation>>;
  appreciationWith?: Maybe<Array<Appreciation>>;
  /** The place where an economic event occurs.  Usually mappable. */
  atLocation?: Maybe<SpatialThing>;
  /** The economic event can be safely deleted, has no dependent information. */
  deletable?: Maybe<Scalars['Boolean']>;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: Maybe<Measure>;
  fulfills?: Maybe<Array<Fulfillment>>;
  /** The beginning of the economic event. */
  hasBeginning?: Maybe<Scalars['DateTime']>;
  /** The end of the economic event. */
  hasEnd?: Maybe<Scalars['DateTime']>;
  /** The date/time at which the economic event occurred. Can be used instead of beginning and end. */
  hasPointInTime?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: Maybe<Array<AccountingScope>>;
  /** Defines the process to which this event is an input. */
  inputOf?: Maybe<Process>;
  meta: RecordMeta;
  next?: Maybe<Array<ProductionFlowItem>>;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  /** Defines the process for which this event is an output. */
  outputOf?: Maybe<Process>;
  previous?: Maybe<Array<ProductionFlowItem>>;
  /** The economic agent from whom the actual economic event is initiated. */
  provider: Agent;
  /** This economic event occurs as part of this agreement. */
  realizationOf?: Maybe<Agreement>;
  /** The economic agent whom the actual economic event is for. */
  receiver: Agent;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: Maybe<Array<Scalars['URI']>>;
  /** The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: Maybe<ResourceSpecification>;
  /** Economic resource involved in the economic event. */
  resourceInventoriedAs?: Maybe<EconomicResource>;
  /** The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action. */
  resourceQuantity?: Maybe<Measure>;
  revision?: Maybe<EconomicEvent>;
  revisionId: Scalars['ID'];
  /** An intent satisfied fully or partially by an economic event or commitment. */
  satisfies?: Maybe<Array<Satisfaction>>;
  settles?: Maybe<Array<Settlement>>;
  /** The new location of the receiver resource. */
  toLocation?: Maybe<SpatialThing>;
  /** Additional economic resource on the economic event when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side. */
  toResourceInventoriedAs?: Maybe<EconomicResource>;
  trace?: Maybe<Array<TrackTraceItem>>;
  track?: Maybe<Array<TrackTraceItem>>;
  /** References another economic event that implied this economic event, often based on a prior agreement. */
  triggeredBy?: Maybe<EconomicEvent>;
  /** Other EconomicEvents which have been triggered by this one. */
  triggers?: Maybe<Array<EconomicEvent>>;
};


/** An observed economic flow, as opposed to a flow planned to happen in the future. This could reflect a change in the quantity of an economic resource. It is also defined by its behavior in relation to the economic resource (see `Action`) */
export type EconomicEventRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type EconomicEventConnection = {
  __typename?: 'EconomicEventConnection';
  edges: Array<EconomicEventEdge>;
  pageInfo: PageInfo;
};

export type EconomicEventCreateParams = {
  /** (`Action`) Relates an economic event to a verb, such as consume, produce, work, improve, etc. */
  action: Scalars['ID'];
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this economic event. */
  agreedIn?: InputMaybe<Scalars['URI']>;
  /** (`SpatialThing`) The place where an economic event occurs.  Usually mappable. */
  atLocation?: InputMaybe<Scalars['ID']>;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** The beginning of the economic event. */
  hasBeginning?: InputMaybe<Scalars['DateTime']>;
  /** The end of the economic event. */
  hasEnd?: InputMaybe<Scalars['DateTime']>;
  /** The date/time at which the economic event occurred. Can be used instead of beginning and end. */
  hasPointInTime?: InputMaybe<Scalars['DateTime']>;
  /** (`Process`) Defines the process to which this event is an input. */
  inputOf?: InputMaybe<Scalars['ID']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Process`) Defines the process for which this event is an output. */
  outputOf?: InputMaybe<Scalars['ID']>;
  /** (`Agent`) The economic agent from whom the actual economic event is initiated. */
  provider: Scalars['ID'];
  /** (`Agreement`) This economic event occurs as part of this agreement. */
  realizationOf?: InputMaybe<Scalars['ID']>;
  /** (`Agent`) The economic agent whom the actual economic event is for. */
  receiver: Scalars['ID'];
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: InputMaybe<Scalars['ID']>;
  /** (`EconomicResource`) Economic resource involved in the economic event. */
  resourceInventoriedAs?: InputMaybe<Scalars['ID']>;
  /** The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action. */
  resourceQuantity?: InputMaybe<IMeasure>;
  /** (`SpatialThing`) The new location of the receiver resource. */
  toLocation?: InputMaybe<Scalars['ID']>;
  /** (`EconomicResource`) Additional economic resource on the economic event when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side. */
  toResourceInventoriedAs?: InputMaybe<Scalars['ID']>;
  /** (`EconomicEvent`) References another economic event that implied this economic event, often based on a prior agreement. */
  triggeredBy?: InputMaybe<Scalars['ID']>;
};

export type EconomicEventEdge = {
  __typename?: 'EconomicEventEdge';
  cursor: Scalars['String'];
  node: EconomicEvent;
};

export type EconomicEventFilterParams = {
  action?: InputMaybe<Array<Scalars['ID']>>;
  endDate?: InputMaybe<Scalars['DateTime']>;
  providerId?: InputMaybe<Array<Scalars['ID']>>;
  receiverId?: InputMaybe<Array<Scalars['ID']>>;
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  searchString?: InputMaybe<Scalars['String']>;
  startDate?: InputMaybe<Scalars['DateTime']>;
};

export type EconomicEventResponse = {
  __typename?: 'EconomicEventResponse';
  /** Details of the newly created event. */
  economicEvent: EconomicEvent;
  /** Details of any newly created `EconomicResource`, for events that create new resources. */
  economicResource?: Maybe<EconomicResource>;
};

export type EconomicEventUpdateParams = {
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this economic event. */
  agreedIn?: InputMaybe<Scalars['URI']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Agreement`) This economic event occurs as part of this agreement. */
  realizationOf?: InputMaybe<Scalars['ID']>;
  revisionId: Scalars['ID'];
  /** (`EconomicEvent`) References another economic event that implied this economic event, often based on a prior agreement. */
  triggeredBy?: InputMaybe<Scalars['ID']>;
};

/** A resource which is useful to people or the ecosystem. */
export type EconomicResource = {
  __typename?: 'EconomicResource';
  /** The current amount and unit of the economic resource for which the agent has primary rights and responsibilities, sometimes thought of as ownership. This can be either stored or derived from economic events affecting the resource. */
  accountingQuantity?: Maybe<Measure>;
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: Maybe<Array<Scalars['URI']>>;
  commitments?: Maybe<CommitmentConnection>;
  /** The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  conformsTo: ResourceSpecification;
  /** Used when a stock economic resource contains items also defined as economic resources. */
  containedIn?: Maybe<EconomicResource>;
  /** Used when a stock economic resource contains units also defined as economic resources. */
  contains?: Maybe<Array<EconomicResource>>;
  /** The current place an economic resource is located. Could be at any level of granularity, from a town to an address to a warehouse location. Usually mappable. */
  currentLocation?: Maybe<SpatialThing>;
  /** Agent who has physical custody of the resource. */
  custodian?: Maybe<Agent>;
  /** All economic events with the economic resource in the resourceInventoriedAs, including all process related events, the provider resource in transfers/moves, and raise/lower. */
  economicEventsInOutFrom?: Maybe<EconomicEventConnection>;
  /** All economic events with the economic Resource in the toResourceInventoriedAs, which is the receiver resource in transfers and moves. */
  economicEventsTo?: Maybe<EconomicEventConnection>;
  id: Scalars['ID'];
  /** The uri to an image relevant to the resource, such as a photo, diagram, etc. */
  image?: Maybe<Scalars['URI']>;
  /** URI addresses to images relevant to the resource. */
  imageList?: Maybe<Array<Scalars['URI']>>;
  intents?: Maybe<IntentConnection>;
  /** Lot or batch of an economic resource, used to track forward or backwards to all occurrences of resources of that lot. Note more than one resource can be of the same lot. */
  lot?: Maybe<ProductBatch>;
  meta: RecordMeta;
  /** An informal or formal textual identifier for an item. Does not imply uniqueness. */
  name?: Maybe<Scalars['String']>;
  next?: Maybe<Array<EconomicEvent>>;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  /** The current amount and unit of the economic resource which is under direct control of the agent.  It may be more or less than the accounting quantity. This can be either stored or derived from economic events affecting the resource. */
  onhandQuantity?: Maybe<Measure>;
  previous?: Maybe<Array<EconomicEvent>>;
  /** The agent currently with primary rights and responsibilites for the economic resource. It is the agent that is associated with the accountingQuantity of the economic resource. */
  primaryAccountable?: Maybe<Agent>;
  revision?: Maybe<EconomicResource>;
  revisionId: Scalars['ID'];
  /** References the ProcessSpecification of the last process the desired economic resource went through. Stage is used when the last process is important for finding proper resources, such as where the publishing process wants only documents that have gone through the editing process. */
  stage?: Maybe<ProcessSpecification>;
  /** The state of the desired economic resource (pass or fail), after coming out of a test or review process. Can be derived from the last event if a pass or fail event. */
  state?: Maybe<Action>;
  trace?: Maybe<Array<TrackTraceItem>>;
  track?: Maybe<Array<TrackTraceItem>>;
  /** Sometimes called serial number, used when each item must have a traceable identifier (like a computer). Could also be used for other unique tracking identifiers needed for resources. */
  trackingIdentifier?: Maybe<Scalars['String']>;
  /** The unit used for use or work or cite actions for this resource. */
  unitOfEffort?: Maybe<Unit>;
};


/** A resource which is useful to people or the ecosystem. */
export type EconomicResourceCommitmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A resource which is useful to people or the ecosystem. */
export type EconomicResourceEconomicEventsInOutFromArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A resource which is useful to people or the ecosystem. */
export type EconomicResourceEconomicEventsToArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A resource which is useful to people or the ecosystem. */
export type EconomicResourceIntentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A resource which is useful to people or the ecosystem. */
export type EconomicResourceRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type EconomicResourceConnection = {
  __typename?: 'EconomicResourceConnection';
  edges: Array<EconomicResourceEdge>;
  pageInfo: PageInfo;
};

/** Input `EconomicResource` type used when sending events to setup initial resource recordings */
export type EconomicResourceCreateParams = {
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  conformsTo?: InputMaybe<Scalars['ID']>;
  /** (`EconomicResource`) Used when a stock economic resource contains items also defined as economic resources. */
  containedIn?: InputMaybe<Scalars['ID']>;
  /** (`SpatialThing`) The current place an economic resource is located.  Could be at any level of granularity, from a town to an address to a warehouse location.  Usually mappable. */
  currentLocation?: InputMaybe<Scalars['ID']>;
  /** The uri to an image relevant to the resource, such as a photo, diagram, etc. */
  image?: InputMaybe<Scalars['URI']>;
  /** URI addresses to images relevant to the resource. */
  imageList?: InputMaybe<Array<Scalars['URI']>>;
  /** (`ProductBatch`) Lot or batch of an economic resource, used to track forward or backwards to all occurrences of resources of that lot. Note more than one resource can be of the same lot. */
  lot?: InputMaybe<Scalars['ID']>;
  /** An informal or formal textual identifier for an item. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** Sometimes called serial number, used when each item must have a traceable identifier (like a computer). Could also be used for other unique tracking identifiers needed for resources. */
  trackingIdentifier?: InputMaybe<Scalars['String']>;
};

export type EconomicResourceEdge = {
  __typename?: 'EconomicResourceEdge';
  cursor: Scalars['String'];
  node: EconomicResource;
};

export type EconomicResourceResponse = {
  __typename?: 'EconomicResourceResponse';
  economicResource: EconomicResource;
};

export type EconomicResourceUpdateParams = {
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** (`EconomicResource`) Used when a stock economic resource contains items also defined as economic resources. */
  containedIn?: InputMaybe<Scalars['ID']>;
  /** The uri to an image relevant to the resource, such as a photo, diagram, etc. */
  image?: InputMaybe<Scalars['URI']>;
  /** URI addresses to images relevant to the resource. */
  imageList?: InputMaybe<Array<Scalars['URI']>>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  revisionId: Scalars['ID'];
  /** (`Unit`) The unit used for use or work or cite actions for this resource. */
  unitOfEffort?: InputMaybe<Scalars['ID']>;
};

export type EventOrCommitment = Commitment | EconomicEvent;

/** Represents many-to-many relationships between commitments and economic events that fully or partially satisfy one or more commitments. */
export type Fulfillment = {
  __typename?: 'Fulfillment';
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: Maybe<Measure>;
  /** The economic event which completely or partially fulfills a commitment. */
  fulfilledBy: EconomicEvent;
  /** The commitment which is completely or partially fulfilled by an economic event. */
  fulfills: Commitment;
  id: Scalars['ID'];
  meta: RecordMeta;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: Maybe<Measure>;
  revision?: Maybe<Fulfillment>;
  revisionId: Scalars['ID'];
};


/** Represents many-to-many relationships between commitments and economic events that fully or partially satisfy one or more commitments. */
export type FulfillmentRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type FulfillmentConnection = {
  __typename?: 'FulfillmentConnection';
  edges: Array<FulfillmentEdge>;
  pageInfo: PageInfo;
};

export type FulfillmentCreateParams = {
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** (`EconomicEvent`) The economic event which completely or partially fulfills a commitment. */
  fulfilledBy: Scalars['ID'];
  /** (`Commitment`) The commitment which is completely or partially fulfilled by an economic event. */
  fulfills: Scalars['ID'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
};

export type FulfillmentEdge = {
  __typename?: 'FulfillmentEdge';
  cursor: Scalars['String'];
  node: Fulfillment;
};

export type FulfillmentFilterParams = {
  /** Match Fulfillments fulfilled by any of the given EconomicEvents */
  fulfilledBy?: InputMaybe<Array<Scalars['ID']>>;
  /** Match Fulfillments fulfilling any of the given Commitments */
  fulfills?: InputMaybe<Array<Scalars['ID']>>;
};

export type FulfillmentResponse = {
  __typename?: 'FulfillmentResponse';
  fulfillment: Fulfillment;
};

export type FulfillmentUpdateParams = {
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** (`EconomicEvent`) The economic event which completely or partially fulfills a commitment. */
  fulfilledBy?: InputMaybe<Scalars['ID']>;
  /** (`Commitment`) The commitment which is completely or partially fulfilled by an economic event. */
  fulfills?: InputMaybe<Scalars['ID']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  revisionId: Scalars['ID'];
};

/** Mutation input structure for defining time durations. */
export type IDuration = {
  /** A number representing the duration, will be paired with a unit. */
  numericDuration: Scalars['Decimal'];
  /** A unit of measure. */
  unitType: TimeUnit;
};

/** Mutation input structure for defining measurements. Should be nulled if not present, rather than empty. */
export type IMeasure = {
  /** A number representing the quantity, will be paired with a unit. */
  hasNumericalValue: Scalars['Decimal'];
  /** (`Unit`) A unit of measure. */
  hasUnit?: InputMaybe<Scalars['ID']>;
};

/** A planned economic flow which has not been committed to, which can lead to economic events (sometimes through commitments). */
export type Intent = {
  __typename?: 'Intent';
  /** Relates an intent to a verb, such as consume, produce, work, improve, etc. */
  action: Action;
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this intent. */
  agreedIn?: Maybe<Scalars['URI']>;
  /** The place where an intent would occur. Usually mappable. */
  atLocation?: Maybe<SpatialThing>;
  /** The total quantity of the offered resource available. */
  availableQuantity?: Maybe<Measure>;
  /** The intent can be safely deleted, has no dependent information. */
  deletable?: Maybe<Scalars['Boolean']>;
  /** The time something is expected to be complete. */
  due?: Maybe<Scalars['DateTime']>;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: Maybe<Measure>;
  /** The intent is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: Maybe<Scalars['Boolean']>;
  /** The planned beginning of the intent. */
  hasBeginning?: Maybe<Scalars['DateTime']>;
  /** The planned end of the intent. */
  hasEnd?: Maybe<Scalars['DateTime']>;
  /** The planned date/time for the intent. Can be used instead of beginning and end. */
  hasPointInTime?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** The uri to an image relevant to the intent, such as a photo. */
  image?: Maybe<Scalars['URI']>;
  /** URI addresses to images relevant to the intent. */
  imageList?: Maybe<Array<Scalars['URI']>>;
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: Maybe<Array<AccountingScope>>;
  /** Defines the process to which this intent is an input. */
  inputOf?: Maybe<Process>;
  meta: RecordMeta;
  /** An informal or formal textual identifier for an intent. Does not imply uniqueness. */
  name?: Maybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  /** Defines the process to which this intent is an output. */
  outputOf?: Maybe<Process>;
  /** The economic agent from whom the intent is initiated. This implies that the intent is an offer. */
  provider?: Maybe<Agent>;
  publishedIn?: Maybe<Array<ProposedIntent>>;
  /** The economic agent whom the intent is for.  This implies that the intent is a request. */
  receiver?: Maybe<Agent>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: Maybe<Array<Scalars['URI']>>;
  /** The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: Maybe<ResourceSpecification>;
  /** Economic resource involved in the intent. */
  resourceInventoriedAs?: Maybe<EconomicResource>;
  /** The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action. */
  resourceQuantity?: Maybe<Measure>;
  revision?: Maybe<Intent>;
  revisionId: Scalars['ID'];
  satisfiedBy?: Maybe<Array<Satisfaction>>;
  /** Additional economic resource on the intent when needed by the receiver. Used when a transfer or move, or sometimes other actions, requires explicitly identifying an economic resource on the receiving side. */
  toResourceInventoriedAs?: Maybe<EconomicResource>;
};


/** A planned economic flow which has not been committed to, which can lead to economic events (sometimes through commitments). */
export type IntentRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type IntentConnection = {
  __typename?: 'IntentConnection';
  edges: Array<IntentEdge>;
  pageInfo: PageInfo;
};

export type IntentCreateParams = {
  /** (`Action`) Relates an intent to a verb, such as consume, produce, work, improve, etc. */
  action: Scalars['ID'];
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this intent. */
  agreedIn?: InputMaybe<Scalars['URI']>;
  /** (`SpatialThing`) The place where an intent occurs. Usually mappable. */
  atLocation?: InputMaybe<Scalars['ID']>;
  /** The total quantity of the offered resource available. */
  availableQuantity?: InputMaybe<IMeasure>;
  /** The time something is expected to be complete. */
  due?: InputMaybe<Scalars['DateTime']>;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** The intent is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: InputMaybe<Scalars['Boolean']>;
  /** The planned beginning of the intent. */
  hasBeginning?: InputMaybe<Scalars['DateTime']>;
  /** The planned end of the intent. */
  hasEnd?: InputMaybe<Scalars['DateTime']>;
  /** The planned date/time for the intent. Can be used instead of beginning and end. */
  hasPointInTime?: InputMaybe<Scalars['DateTime']>;
  /** The uri to an image relevant to the intent, such as a photo. */
  image?: InputMaybe<Scalars['URI']>;
  /** URI addresses to images relevant to the intent. */
  imageList?: InputMaybe<Array<Scalars['URI']>>;
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** (`Process`) Defines the process to which this intent is an input. */
  inputOf?: InputMaybe<Scalars['ID']>;
  /** An informal or formal textual identifier for an intent. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Process`) Defines the process to which this intent is an output. */
  outputOf?: InputMaybe<Scalars['ID']>;
  /** (`Agent`) The economic agent from whom the intent is initiated. This implies that the intent is an offer. */
  provider?: InputMaybe<Scalars['ID']>;
  /** (`Agent`) The economic agent whom the intent is for.  This implies that the intent is a request. */
  receiver?: InputMaybe<Scalars['ID']>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: InputMaybe<Scalars['ID']>;
  /** (`EconomicResource`) When a specific `EconomicResource` is known which can service the `Intent`, this defines that resource. */
  resourceInventoriedAs?: InputMaybe<Scalars['ID']>;
  /** The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action. */
  resourceQuantity?: InputMaybe<IMeasure>;
};

export type IntentEdge = {
  __typename?: 'IntentEdge';
  cursor: Scalars['String'];
  node: Intent;
};

export type IntentFilterParams = {
  action?: InputMaybe<Array<Scalars['ID']>>;
  agent?: InputMaybe<Array<Scalars['ID']>>;
  atLocation?: InputMaybe<Array<Scalars['ID']>>;
  classifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  endDate?: InputMaybe<Scalars['DateTime']>;
  finished?: InputMaybe<Scalars['Boolean']>;
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  provider?: InputMaybe<Array<Scalars['ID']>>;
  providerId?: InputMaybe<Array<Scalars['ID']>>;
  receiver?: InputMaybe<Array<Scalars['ID']>>;
  receiverId?: InputMaybe<Array<Scalars['ID']>>;
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  resourceConformsTo?: InputMaybe<Array<Scalars['ID']>>;
  searchString?: InputMaybe<Scalars['String']>;
  startDate?: InputMaybe<Scalars['DateTime']>;
  status?: InputMaybe<Scalars['String']>;
  tagIds?: InputMaybe<Array<Scalars['ID']>>;
};

export type IntentResponse = {
  __typename?: 'IntentResponse';
  intent: Intent;
};

export type IntentUpdateParams = {
  /** (`Action`) Relates an intent to a verb, such as consume, produce, work, improve, etc. */
  action?: InputMaybe<Scalars['ID']>;
  /** Reference to an agreement between agents which specifies the rules or policies or calculations which govern this intent. */
  agreedIn?: InputMaybe<Scalars['URI']>;
  /** (`SpatialThing`) The place where an intent occurs. Usually mappable. */
  atLocation?: InputMaybe<Scalars['ID']>;
  /** The total quantity of the offered resource available. */
  availableQuantity?: InputMaybe<IMeasure>;
  /** The time something is expected to be complete. */
  due?: InputMaybe<Scalars['DateTime']>;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** The intent is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: InputMaybe<Scalars['Boolean']>;
  /** The planned beginning of the intent. */
  hasBeginning?: InputMaybe<Scalars['DateTime']>;
  /** The planned end of the intent. */
  hasEnd?: InputMaybe<Scalars['DateTime']>;
  /** The planned date/time for the intent. Can be used instead of beginning and end. */
  hasPointInTime?: InputMaybe<Scalars['DateTime']>;
  /** The uri to an image relevant to the intent, such as a photo. */
  image?: InputMaybe<Scalars['URI']>;
  /** URI addresses to images relevant to the intent. */
  imageList?: InputMaybe<Array<Scalars['URI']>>;
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** (`Process`) Defines the process to which this intent is an input. */
  inputOf?: InputMaybe<Scalars['ID']>;
  /** An informal or formal textual identifier for an intent. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Process`) Defines the process to which this intent is an output. */
  outputOf?: InputMaybe<Scalars['ID']>;
  /** (`Agent`) The economic agent from whom the intent is initiated. This implies that the intent is an offer. */
  provider?: InputMaybe<Scalars['ID']>;
  /** (`Agent`) The economic agent whom the intent is for.  This implies that the intent is a request. */
  receiver?: InputMaybe<Scalars['ID']>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** (`ResourceSpecification`) The primary resource specification or definition of an existing or potential economic resource. A resource will have only one, as this specifies exactly what the resource is. */
  resourceConformsTo?: InputMaybe<Scalars['ID']>;
  /** (`EconomicResource`) When a specific `EconomicResource` is known which can service the `Intent`, this defines that resource. */
  resourceInventoriedAs?: InputMaybe<Scalars['ID']>;
  /** The amount and unit of the economic resource counted or inventoried. This is the quantity that could be used to increment or decrement a resource, depending on the type of resource and resource effect of action. */
  resourceQuantity?: InputMaybe<IMeasure>;
  revisionId: Scalars['ID'];
};

export type IntentsOrder = {
  availableQuantity?: InputMaybe<Sort>;
  due?: InputMaybe<Sort>;
  effortQuantity?: InputMaybe<Sort>;
  endTime?: InputMaybe<Sort>;
  name?: InputMaybe<Sort>;
  resourceQuantity?: InputMaybe<Sort>;
  startTime?: InputMaybe<Sort>;
};

/**
 * Semantic meaning for measurements: binds a quantity to its measurement unit.
 * See http://www.qudt.org/pages/QUDToverviewPage.html
 */
export type Measure = {
  __typename?: 'Measure';
  /** A number representing the quantity, will be paired with a unit. */
  hasNumericalValue: Scalars['Decimal'];
  /** A unit of measure. */
  hasUnit?: Maybe<Unit>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createAgentRelationship: AgentRelationshipResponse;
  createAgentRelationshipRole: AgentRelationshipRoleResponse;
  createAgreement: AgreementResponse;
  createAppreciation: AppreciationResponse;
  createClaim: ClaimResponse;
  createCommitment: CommitmentResponse;
  /** Registers a new (`EconomicEvent`) with the collaboration space. Also serves as a means to register (`EconomicResource`) as well, instead of createEconomicResource */
  createEconomicEvent: EconomicEventResponse;
  createFulfillment: FulfillmentResponse;
  createIntent: IntentResponse;
  /** Registers a new organization (group agent) with the collaboration space */
  createOrganization: OrganizationResponse;
  /** Registers a new (human) person with the collaboration space */
  createPerson: PersonResponse;
  createPlan: PlanResponse;
  createProcess: ProcessResponse;
  createProcessSpecification: ProcessSpecificationResponse;
  createProductBatch: ProductBatchResponse;
  createProposal: ProposalResponse;
  createRecipeExchange: RecipeExchangeResponse;
  createRecipeFlow: RecipeFlowResponse;
  createRecipeProcess: RecipeProcessResponse;
  createResourceSpecification: ResourceSpecificationResponse;
  createSatisfaction: SatisfactionResponse;
  createScenario: ScenarioResponse;
  createScenarioDefinition: ScenarioDefinitionResponse;
  createSettlement: SettlementResponse;
  createSpatialThing: SpatialThingResponse;
  createUnit: UnitResponse;
  deleteAgentRelationship: Scalars['Boolean'];
  deleteAgentRelationshipRole: Scalars['Boolean'];
  deleteAgreement: Scalars['Boolean'];
  deleteAppreciation: Scalars['Boolean'];
  deleteClaim: Scalars['Boolean'];
  deleteCommitment: Scalars['Boolean'];
  deleteFulfillment: Scalars['Boolean'];
  deleteIntent: Scalars['Boolean'];
  /** Erase record of an organization and thus remove it from the collaboration space */
  deleteOrganization: Scalars['Boolean'];
  /** Erase record of a person and thus remove them from the collaboration space */
  deletePerson: Scalars['Boolean'];
  deletePlan: Scalars['Boolean'];
  deleteProcess: Scalars['Boolean'];
  deleteProcessSpecification: Scalars['Boolean'];
  deleteProductBatch: Scalars['Boolean'];
  deleteProposal: Scalars['Boolean'];
  deleteProposedIntent: Scalars['Boolean'];
  deleteProposedTo: Scalars['Boolean'];
  deleteRecipeExchange: Scalars['Boolean'];
  deleteRecipeFlow: Scalars['Boolean'];
  deleteRecipeProcess: Scalars['Boolean'];
  deleteResourceSpecification: Scalars['Boolean'];
  deleteSatisfaction: Scalars['Boolean'];
  deleteScenario: Scalars['Boolean'];
  deleteScenarioDefinition: Scalars['Boolean'];
  deleteSettlement: Scalars['Boolean'];
  deleteSpatialThing: Scalars['Boolean'];
  deleteUnit: Scalars['Boolean'];
  /**
   * Include an existing intent as part of a proposal.
   * @param publishedIn the (`Proposal`) to include the intent in
   * @param publishes the (`Intent`) to include as part of the proposal
   */
  proposeIntent: ProposedIntentResponse;
  /**
   * Send a proposal to another agent.
   * @param proposed the (`Proposal`) to send to an involved agent
   * @param proposedTo the (`Agent`) to include in the proposal
   */
  proposeTo: ProposedToResponse;
  updateAgentRelationship: AgentRelationshipResponse;
  updateAgentRelationshipRole: AgentRelationshipRoleResponse;
  updateAgreement: AgreementResponse;
  updateAppreciation: AppreciationResponse;
  updateClaim: ClaimResponse;
  updateCommitment: CommitmentResponse;
  updateEconomicEvent: EconomicEventResponse;
  updateEconomicResource: EconomicResourceResponse;
  updateFulfillment: FulfillmentResponse;
  updateIntent: IntentResponse;
  /** Update organization profile details */
  updateOrganization: OrganizationResponse;
  /** Update profile details */
  updatePerson: PersonResponse;
  updatePlan: PlanResponse;
  updateProcess: ProcessResponse;
  updateProcessSpecification: ProcessSpecificationResponse;
  updateProductBatch: ProductBatchResponse;
  updateProposal: ProposalResponse;
  updateRecipeExchange: RecipeExchangeResponse;
  updateRecipeFlow: RecipeFlowResponse;
  updateRecipeProcess: RecipeProcessResponse;
  updateResourceSpecification: ResourceSpecificationResponse;
  updateSatisfaction: SatisfactionResponse;
  updateScenario: ScenarioResponse;
  updateScenarioDefinition: ScenarioDefinitionResponse;
  updateSettlement: SettlementResponse;
  updateSpatialThing: SpatialThingResponse;
  updateUnit: UnitResponse;
};


export type MutationCreateAgentRelationshipArgs = {
  relationship: AgentRelationshipCreateParams;
};


export type MutationCreateAgentRelationshipRoleArgs = {
  agentRelationshipRole: AgentRelationshipRoleCreateParams;
};


export type MutationCreateAgreementArgs = {
  agreement?: InputMaybe<AgreementCreateParams>;
};


export type MutationCreateAppreciationArgs = {
  appreciation: AppreciationCreateParams;
};


export type MutationCreateClaimArgs = {
  claim: ClaimCreateParams;
};


export type MutationCreateCommitmentArgs = {
  commitment: CommitmentCreateParams;
};


export type MutationCreateEconomicEventArgs = {
  event: EconomicEventCreateParams;
  newInventoriedResource?: InputMaybe<EconomicResourceCreateParams>;
};


export type MutationCreateFulfillmentArgs = {
  fulfillment: FulfillmentCreateParams;
};


export type MutationCreateIntentArgs = {
  intent: IntentCreateParams;
};


export type MutationCreateOrganizationArgs = {
  organization: OrganizationCreateParams;
};


export type MutationCreatePersonArgs = {
  person: AgentCreateParams;
};


export type MutationCreatePlanArgs = {
  plan: PlanCreateParams;
};


export type MutationCreateProcessArgs = {
  process: ProcessCreateParams;
};


export type MutationCreateProcessSpecificationArgs = {
  processSpecification: ProcessSpecificationCreateParams;
};


export type MutationCreateProductBatchArgs = {
  productBatch: ProductBatchCreateParams;
};


export type MutationCreateProposalArgs = {
  proposal: ProposalCreateParams;
};


export type MutationCreateRecipeExchangeArgs = {
  recipeExchange: RecipeExchangeCreateParams;
};


export type MutationCreateRecipeFlowArgs = {
  recipeFlow: RecipeFlowCreateParams;
};


export type MutationCreateRecipeProcessArgs = {
  recipeProcess: RecipeProcessCreateParams;
};


export type MutationCreateResourceSpecificationArgs = {
  resourceSpecification: ResourceSpecificationCreateParams;
};


export type MutationCreateSatisfactionArgs = {
  satisfaction: SatisfactionCreateParams;
};


export type MutationCreateScenarioArgs = {
  plan: ScenarioCreateParams;
};


export type MutationCreateScenarioDefinitionArgs = {
  plan: ScenarioDefinitionCreateParams;
};


export type MutationCreateSettlementArgs = {
  settlement: SettlementCreateParams;
};


export type MutationCreateSpatialThingArgs = {
  spatialThing: SpatialThingCreateParams;
};


export type MutationCreateUnitArgs = {
  unit: UnitCreateParams;
};


export type MutationDeleteAgentRelationshipArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteAgentRelationshipRoleArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteAgreementArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteAppreciationArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteClaimArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteCommitmentArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteFulfillmentArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteIntentArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteOrganizationArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeletePersonArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeletePlanArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteProcessArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteProcessSpecificationArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteProductBatchArgs = {
  id: Scalars['ID'];
};


export type MutationDeleteProposalArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteProposedIntentArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteProposedToArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteRecipeExchangeArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteRecipeFlowArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteRecipeProcessArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteResourceSpecificationArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteSatisfactionArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteScenarioArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteScenarioDefinitionArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteSettlementArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteSpatialThingArgs = {
  revisionId: Scalars['ID'];
};


export type MutationDeleteUnitArgs = {
  revisionId: Scalars['ID'];
};


export type MutationProposeIntentArgs = {
  publishedIn: Scalars['ID'];
  publishes: Scalars['ID'];
  reciprocal?: InputMaybe<Scalars['Boolean']>;
};


export type MutationProposeToArgs = {
  proposed: Scalars['ID'];
  proposedTo: Scalars['ID'];
};


export type MutationUpdateAgentRelationshipArgs = {
  relationship: AgentRelationshipUpdateParams;
};


export type MutationUpdateAgentRelationshipRoleArgs = {
  agentRelationshipRole: AgentRelationshipRoleUpdateParams;
};


export type MutationUpdateAgreementArgs = {
  agreement?: InputMaybe<AgreementUpdateParams>;
};


export type MutationUpdateAppreciationArgs = {
  appreciation: AppreciationUpdateParams;
};


export type MutationUpdateClaimArgs = {
  claim: ClaimUpdateParams;
};


export type MutationUpdateCommitmentArgs = {
  commitment: CommitmentUpdateParams;
};


export type MutationUpdateEconomicEventArgs = {
  event: EconomicEventUpdateParams;
};


export type MutationUpdateEconomicResourceArgs = {
  resource: EconomicResourceUpdateParams;
};


export type MutationUpdateFulfillmentArgs = {
  fulfillment: FulfillmentUpdateParams;
};


export type MutationUpdateIntentArgs = {
  intent: IntentUpdateParams;
};


export type MutationUpdateOrganizationArgs = {
  organization: OrganizationUpdateParams;
};


export type MutationUpdatePersonArgs = {
  person: AgentUpdateParams;
};


export type MutationUpdatePlanArgs = {
  plan: PlanUpdateParams;
};


export type MutationUpdateProcessArgs = {
  process: ProcessUpdateParams;
};


export type MutationUpdateProcessSpecificationArgs = {
  processSpecification: ProcessSpecificationUpdateParams;
};


export type MutationUpdateProductBatchArgs = {
  productBatch: ProductBatchUpdateParams;
};


export type MutationUpdateProposalArgs = {
  proposal: ProposalUpdateParams;
};


export type MutationUpdateRecipeExchangeArgs = {
  recipeExchange: RecipeExchangeUpdateParams;
};


export type MutationUpdateRecipeFlowArgs = {
  recipeFlow: RecipeFlowUpdateParams;
};


export type MutationUpdateRecipeProcessArgs = {
  recipeProcess: RecipeProcessUpdateParams;
};


export type MutationUpdateResourceSpecificationArgs = {
  resourceSpecification: ResourceSpecificationUpdateParams;
};


export type MutationUpdateSatisfactionArgs = {
  satisfaction: SatisfactionUpdateParams;
};


export type MutationUpdateScenarioArgs = {
  plan: ScenarioUpdateParams;
};


export type MutationUpdateScenarioDefinitionArgs = {
  plan: ScenarioDefinitionUpdateParams;
};


export type MutationUpdateSettlementArgs = {
  settlement: SettlementUpdateParams;
};


export type MutationUpdateSpatialThingArgs = {
  spatialThing: SpatialThingUpdateParams;
};


export type MutationUpdateUnitArgs = {
  unit: UnitUpdateParams;
};

/** A formal or informal group, or legal organization. */
export type Organization = Agent & {
  __typename?: 'Organization';
  claims?: Maybe<IntentConnection>;
  claimsAsProvider?: Maybe<IntentConnection>;
  claimsAsReceiver?: Maybe<IntentConnection>;
  claimsInScope?: Maybe<IntentConnection>;
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: Maybe<Array<Scalars['URI']>>;
  commitments?: Maybe<CommitmentConnection>;
  commitmentsAsProvider?: Maybe<CommitmentConnection>;
  commitmentsAsReceiver?: Maybe<CommitmentConnection>;
  commitmentsInScope?: Maybe<CommitmentConnection>;
  economicEvents?: Maybe<EconomicEventConnection>;
  economicEventsAsProvider?: Maybe<EconomicEventConnection>;
  economicEventsAsReceiver?: Maybe<EconomicEventConnection>;
  economicEventsInScope?: Maybe<EconomicEventConnection>;
  id: Scalars['ID'];
  /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: Maybe<Scalars['URI']>;
  intents?: Maybe<IntentConnection>;
  intentsAsProvider?: Maybe<IntentConnection>;
  intentsAsReceiver?: Maybe<IntentConnection>;
  intentsInScope?: Maybe<IntentConnection>;
  inventoriedEconomicResources?: Maybe<EconomicResourceConnection>;
  meta: RecordMeta;
  /** The name that this agent will be referred to by. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  plans?: Maybe<PlanConnection>;
  /** The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: Maybe<SpatialThing>;
  processes?: Maybe<ProcessConnection>;
  proposals?: Maybe<ProposalConnection>;
  proposalsInScope?: Maybe<ProposalConnection>;
  proposalsTo?: Maybe<ProposalConnection>;
  relationships?: Maybe<AgentRelationshipConnection>;
  relationshipsAsObject?: Maybe<AgentRelationshipConnection>;
  relationshipsAsSubject?: Maybe<AgentRelationshipConnection>;
  revision?: Maybe<Organization>;
  revisionId: Scalars['ID'];
  roles?: Maybe<Array<AgentRelationshipRole>>;
  scenariosInScope?: Maybe<ScenarioConnection>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationClaimsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationClaimsAsProviderArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationClaimsAsReceiverArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationClaimsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationCommitmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentCommitmentFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationCommitmentsAsProviderArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationCommitmentsAsReceiverArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationCommitmentsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationEconomicEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentEventFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationEconomicEventsAsProviderArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationEconomicEventsAsReceiverArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationEconomicEventsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationIntentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentIntentFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationIntentsAsProviderArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationIntentsAsReceiverArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationIntentsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationInventoriedEconomicResourcesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentResourceFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationPlansArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentPlanFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationProcessesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentProcessFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationProposalsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentProposalSearchParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationProposalsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationProposalsToArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationRelationshipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentRelationshipFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationRelationshipsAsObjectArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentRelationshipFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationRelationshipsAsSubjectArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentRelationshipFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A formal or informal group, or legal organization. */
export type OrganizationRevisionArgs = {
  revisionId: Scalars['ID'];
};


/** A formal or informal group, or legal organization. */
export type OrganizationScenariosInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type OrganizationConnection = {
  __typename?: 'OrganizationConnection';
  edges: Array<OrganizationEdge>;
  pageInfo: PageInfo;
};

export type OrganizationCreateParams = {
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: InputMaybe<Scalars['URI']>;
  /** An informal or formal textual identifier for an agent. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`SpatialThing`) The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: InputMaybe<Scalars['ID']>;
};

export type OrganizationEdge = {
  __typename?: 'OrganizationEdge';
  cursor: Scalars['String'];
  node: Organization;
};

export type OrganizationResponse = {
  __typename?: 'OrganizationResponse';
  agent: Organization;
};

export type OrganizationUpdateParams = {
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: InputMaybe<Scalars['URI']>;
  /** An informal or formal textual identifier for an agent. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`SpatialThing`) The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: InputMaybe<Scalars['ID']>;
  revisionId: Scalars['ID'];
};

/** Cursors for pagination */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** Cursor pointing to the last of the results returned, to be used with `after` query parameter if the backend supports forward pagination. */
  endCursor?: Maybe<Scalars['String']>;
  /** True if there are more results after `endCursor`. If unable to be determined, implementations should return `true` to allow for requerying. */
  hasNextPage: Scalars['Boolean'];
  /** True if there are more results before `startCursor`. If unable to be determined, implementations should return `true` to allow for requerying. */
  hasPreviousPage: Scalars['Boolean'];
  /** The number of items requested per page. Allows the storage backend to indicate this when it is responsible for setting a default and the client does not provide it. Note this may be different to the number of items returned, if there is less than 1 page of results. */
  pageLimit?: Maybe<Scalars['Int']>;
  /** Cursor pointing to the first of the results returned, to be used with `before` query parameter if the backend supports reverse pagination. */
  startCursor?: Maybe<Scalars['String']>;
  /** The total result count, if it can be determined. */
  totalCount?: Maybe<Scalars['Int']>;
};

/** A natural person. */
export type Person = Agent & {
  __typename?: 'Person';
  claims?: Maybe<IntentConnection>;
  claimsAsProvider?: Maybe<IntentConnection>;
  claimsAsReceiver?: Maybe<IntentConnection>;
  claimsInScope?: Maybe<IntentConnection>;
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: Maybe<Array<Scalars['URI']>>;
  commitments?: Maybe<CommitmentConnection>;
  commitmentsAsProvider?: Maybe<CommitmentConnection>;
  commitmentsAsReceiver?: Maybe<CommitmentConnection>;
  commitmentsInScope?: Maybe<CommitmentConnection>;
  economicEvents?: Maybe<EconomicEventConnection>;
  economicEventsAsProvider?: Maybe<EconomicEventConnection>;
  economicEventsAsReceiver?: Maybe<EconomicEventConnection>;
  economicEventsInScope?: Maybe<EconomicEventConnection>;
  id: Scalars['ID'];
  /** The uri to an image relevant to the agent, such as a logo, avatar, photo, etc. */
  image?: Maybe<Scalars['URI']>;
  intents?: Maybe<IntentConnection>;
  intentsAsProvider?: Maybe<IntentConnection>;
  intentsAsReceiver?: Maybe<IntentConnection>;
  intentsInScope?: Maybe<IntentConnection>;
  inventoriedEconomicResources?: Maybe<EconomicResourceConnection>;
  meta: RecordMeta;
  /** The name that this agent will be referred to by. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  plans?: Maybe<PlanConnection>;
  /** The main place an agent is located, often an address where activities occur and mail can be sent. This is usually a mappable geographic location.  It also could be a website address, as in the case of agents who have no physical location. */
  primaryLocation?: Maybe<SpatialThing>;
  processes?: Maybe<ProcessConnection>;
  proposals?: Maybe<ProposalConnection>;
  proposalsInScope?: Maybe<ProposalConnection>;
  proposalsTo?: Maybe<ProposalConnection>;
  relationships?: Maybe<AgentRelationshipConnection>;
  relationshipsAsObject?: Maybe<AgentRelationshipConnection>;
  relationshipsAsSubject?: Maybe<AgentRelationshipConnection>;
  revision?: Maybe<Person>;
  revisionId: Scalars['ID'];
  roles?: Maybe<Array<AgentRelationshipRole>>;
  scenariosInScope?: Maybe<ScenarioConnection>;
};


/** A natural person. */
export type PersonClaimsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonClaimsAsProviderArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonClaimsAsReceiverArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonClaimsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonCommitmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentCommitmentFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonCommitmentsAsProviderArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonCommitmentsAsReceiverArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonCommitmentsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonEconomicEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentEventFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonEconomicEventsAsProviderArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonEconomicEventsAsReceiverArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonEconomicEventsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonIntentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentIntentFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonIntentsAsProviderArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonIntentsAsReceiverArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonIntentsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonInventoriedEconomicResourcesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentResourceFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonPlansArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentPlanFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonProcessesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentProcessFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonProposalsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentProposalSearchParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonProposalsInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonProposalsToArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonRelationshipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentRelationshipFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonRelationshipsAsObjectArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentRelationshipFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonRelationshipsAsSubjectArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentRelationshipFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A natural person. */
export type PersonRevisionArgs = {
  revisionId: Scalars['ID'];
};


/** A natural person. */
export type PersonScenariosInScopeArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type PersonConnection = {
  __typename?: 'PersonConnection';
  edges: Array<PersonEdge>;
  pageInfo: PageInfo;
};

export type PersonEdge = {
  __typename?: 'PersonEdge';
  cursor: Scalars['String'];
  node: Person;
};

export type PersonResponse = {
  __typename?: 'PersonResponse';
  agent: Person;
};

/** A logical collection of processes that constitute a body of planned work with defined deliverable(s). */
export type Plan = {
  __typename?: 'Plan';
  /** The time the plan was made. */
  created?: Maybe<Scalars['DateTime']>;
  /** The plan is able to be deleted or not. */
  deletable?: Maybe<Scalars['Boolean']>;
  /** The time the plan is expected to be complete. */
  due?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: Maybe<Array<AccountingScope>>;
  independentDemands?: Maybe<Array<Commitment>>;
  involvedAgents?: Maybe<AgentConnection>;
  meta: RecordMeta;
  /** An informal or formal textual identifier for a plan. Does not imply uniqueness. */
  name: Scalars['String'];
  nonProcessCommitments?: Maybe<Array<Commitment>>;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  processes?: Maybe<Array<Process>>;
  /** This plan refines a scenario, making it operational. */
  refinementOf?: Maybe<Scenario>;
  revision?: Maybe<Plan>;
  revisionId: Scalars['ID'];
};


/** A logical collection of processes that constitute a body of planned work with defined deliverable(s). */
export type PlanInvolvedAgentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A logical collection of processes that constitute a body of planned work with defined deliverable(s). */
export type PlanProcessesArgs = {
  filter?: InputMaybe<PlanProcessFilterParams>;
};


/** A logical collection of processes that constitute a body of planned work with defined deliverable(s). */
export type PlanRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type PlanConnection = {
  __typename?: 'PlanConnection';
  edges: Array<PlanEdge>;
  pageInfo: PageInfo;
};

export type PlanCreateParams = {
  /** The time the plan was made. */
  created?: InputMaybe<Scalars['DateTime']>;
  /** The time the plan is expected to be complete. */
  due?: InputMaybe<Scalars['DateTime']>;
  /** An informal or formal textual identifier for a plan. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Scenario`) This plan refines a scenario, making it operational. */
  refinementOf?: InputMaybe<Scalars['ID']>;
};

export type PlanEdge = {
  __typename?: 'PlanEdge';
  cursor: Scalars['String'];
  node: Plan;
};

/** Query parameters for reading `Process`es related to a `Plan` */
export type PlanProcessFilterParams = {
  after?: InputMaybe<Scalars['DateTime']>;
  before?: InputMaybe<Scalars['DateTime']>;
  finished?: InputMaybe<Scalars['Boolean']>;
  searchString?: InputMaybe<Scalars['String']>;
};

export type PlanResponse = {
  __typename?: 'PlanResponse';
  plan: Plan;
};

export type PlanUpdateParams = {
  /** The time the plan was made. */
  created?: InputMaybe<Scalars['DateTime']>;
  /** The time the plan is expected to be complete. */
  due?: InputMaybe<Scalars['DateTime']>;
  /** An informal or formal textual identifier for a plan. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Scenario`) This plan refines a scenario, making it operational. */
  refinementOf?: InputMaybe<Scalars['ID']>;
  revisionId: Scalars['ID'];
};

/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type Process = {
  __typename?: 'Process';
  /** The definition or specification for a process. */
  basedOn?: Maybe<ProcessSpecification>;
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: Maybe<Array<Scalars['URI']>>;
  committedInputs?: Maybe<Array<Commitment>>;
  committedOutputs?: Maybe<Array<Commitment>>;
  /** The process can be safely deleted, has no dependent information. */
  deletable?: Maybe<Scalars['Boolean']>;
  /** The process is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: Maybe<Scalars['Boolean']>;
  /** The planned beginning of the process. */
  hasBeginning?: Maybe<Scalars['DateTime']>;
  /** The planned end of the process. */
  hasEnd?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: Maybe<Array<AccountingScope>>;
  intendedInputs?: Maybe<Array<Intent>>;
  intendedOutputs?: Maybe<Array<Intent>>;
  involvedAgents?: Maybe<AgentConnection>;
  meta: RecordMeta;
  /** An informal or formal textual identifier for a process. Does not imply uniqueness. */
  name: Scalars['String'];
  /** The process with its inputs and outputs is part of the scenario. */
  nestedIn?: Maybe<Scenario>;
  next?: Maybe<Array<EconomicEvent>>;
  nextProcesses?: Maybe<Array<Process>>;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  observedInputs?: Maybe<Array<EconomicEvent>>;
  observedOutputs?: Maybe<Array<EconomicEvent>>;
  /** The process with its inputs and outputs is part of the plan. */
  plannedWithin?: Maybe<Plan>;
  previous?: Maybe<Array<EconomicEvent>>;
  previousProcesses?: Maybe<Array<Process>>;
  revision?: Maybe<Process>;
  revisionId: Scalars['ID'];
  unplannedInputs?: Maybe<Array<EconomicEvent>>;
  unplannedOutputs?: Maybe<Array<EconomicEvent>>;
  workingAgents?: Maybe<AgentConnection>;
};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessCommittedInputsArgs = {
  filter?: InputMaybe<ProcessCommitmentFilterParams>;
};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessCommittedOutputsArgs = {
  filter?: InputMaybe<ProcessCommitmentFilterParams>;
};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessIntendedInputsArgs = {
  filter?: InputMaybe<ProcessIntentFilterParams>;
};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessIntendedOutputsArgs = {
  filter?: InputMaybe<ProcessIntentFilterParams>;
};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessInvolvedAgentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessObservedInputsArgs = {
  filter?: InputMaybe<ProcessEventFilterParams>;
};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessObservedOutputsArgs = {
  filter?: InputMaybe<ProcessEventFilterParams>;
};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessRevisionArgs = {
  revisionId: Scalars['ID'];
};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessUnplannedInputsArgs = {
  filter?: InputMaybe<ProcessEventFilterParams>;
};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessUnplannedOutputsArgs = {
  filter?: InputMaybe<ProcessEventFilterParams>;
};


/** An activity that changes inputs into outputs.  It could transform or transport economic resource(s). */
export type ProcessWorkingAgentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type ProcessCommitmentFilterParams = {
  action?: InputMaybe<Array<Scalars['ID']>>;
  endDate?: InputMaybe<Scalars['DateTime']>;
  providerId?: InputMaybe<Array<Scalars['ID']>>;
  receiverId?: InputMaybe<Array<Scalars['ID']>>;
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  searchString?: InputMaybe<Scalars['String']>;
  startDate?: InputMaybe<Scalars['DateTime']>;
};

export type ProcessConnection = {
  __typename?: 'ProcessConnection';
  edges: Array<ProcessEdge>;
  pageInfo: PageInfo;
};

export type ProcessCreateParams = {
  /** (`ProcessSpecification`) The definition or specification for a process. */
  basedOn?: InputMaybe<Scalars['ID']>;
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** The process is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: InputMaybe<Scalars['Boolean']>;
  /** The planned beginning of the process. */
  hasBeginning?: InputMaybe<Scalars['DateTime']>;
  /** The planned end of the process. */
  hasEnd?: InputMaybe<Scalars['DateTime']>;
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** An informal or formal textual identifier for a process. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Plan`) The process with its inputs and outputs is part of the plan. */
  plannedWithin?: InputMaybe<Scalars['ID']>;
};

export type ProcessEdge = {
  __typename?: 'ProcessEdge';
  cursor: Scalars['String'];
  node: Process;
};

export type ProcessEventFilterParams = {
  action?: InputMaybe<Array<Scalars['ID']>>;
  endDate?: InputMaybe<Scalars['DateTime']>;
  providerId?: InputMaybe<Array<Scalars['ID']>>;
  receiverId?: InputMaybe<Array<Scalars['ID']>>;
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  searchString?: InputMaybe<Scalars['String']>;
  startDate?: InputMaybe<Scalars['DateTime']>;
};

export type ProcessFilterParams = {
  classifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  endDate?: InputMaybe<Scalars['DateTime']>;
  finished?: InputMaybe<Scalars['Boolean']>;
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  searchString?: InputMaybe<Scalars['String']>;
  startDate?: InputMaybe<Scalars['DateTime']>;
};

export type ProcessIntentFilterParams = {
  action?: InputMaybe<Array<Scalars['ID']>>;
  endDate?: InputMaybe<Scalars['DateTime']>;
  providerId?: InputMaybe<Array<Scalars['ID']>>;
  receiverId?: InputMaybe<Array<Scalars['ID']>>;
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  searchString?: InputMaybe<Scalars['String']>;
  startDate?: InputMaybe<Scalars['DateTime']>;
};

export type ProcessResponse = {
  __typename?: 'ProcessResponse';
  process: Process;
};

/** Specifies the kind of process. */
export type ProcessSpecification = {
  __typename?: 'ProcessSpecification';
  commitmentsRequiringStage?: Maybe<CommitmentConnection>;
  conformingProcesses?: Maybe<ProcessConnection>;
  conformingRecipeProcesses?: Maybe<RecipeProcessConnection>;
  id: Scalars['ID'];
  /** The image of the process. */
  image?: Maybe<Scalars['String']>;
  meta: RecordMeta;
  /** An informal or formal textual identifier for the process. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  recipeFlowsRequiringStage?: Maybe<RecipeFlowConnection>;
  resourcesCurrentlyAtStage?: Maybe<EconomicResourceConnection>;
  revision?: Maybe<ProcessSpecification>;
  revisionId: Scalars['ID'];
};


/** Specifies the kind of process. */
export type ProcessSpecificationCommitmentsRequiringStageArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Specifies the kind of process. */
export type ProcessSpecificationConformingProcessesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Specifies the kind of process. */
export type ProcessSpecificationConformingRecipeProcessesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Specifies the kind of process. */
export type ProcessSpecificationRecipeFlowsRequiringStageArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Specifies the kind of process. */
export type ProcessSpecificationResourcesCurrentlyAtStageArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** Specifies the kind of process. */
export type ProcessSpecificationRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type ProcessSpecificationConnection = {
  __typename?: 'ProcessSpecificationConnection';
  edges: Array<ProcessSpecificationEdge>;
  pageInfo: PageInfo;
};

export type ProcessSpecificationCreateParams = {
  /** The image of the process. */
  image?: InputMaybe<Scalars['String']>;
  /** An informal or formal textual identifier for the process. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
};

export type ProcessSpecificationEdge = {
  __typename?: 'ProcessSpecificationEdge';
  cursor: Scalars['String'];
  node: ProcessSpecification;
};

export type ProcessSpecificationResponse = {
  __typename?: 'ProcessSpecificationResponse';
  processSpecification: ProcessSpecification;
};

export type ProcessSpecificationUpdateParams = {
  /** The image of the process. */
  image?: InputMaybe<Scalars['String']>;
  /** An informal or formal textual identifier for the process. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  revisionId: Scalars['ID'];
};

export type ProcessUpdateParams = {
  /** (`ProcessSpecification`) The definition or specification for a process. */
  basedOn?: InputMaybe<Scalars['ID']>;
  /** References one or more concepts in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  classifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** The process is complete or not.  This is irrespective of if the original goal has been met, and indicates that no more will be done. */
  finished?: InputMaybe<Scalars['Boolean']>;
  /** The planned beginning of the process. */
  hasBeginning?: InputMaybe<Scalars['DateTime']>;
  /** The planned end of the process. */
  hasEnd?: InputMaybe<Scalars['DateTime']>;
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** An informal or formal textual identifier for a process. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Plan`) The process with its inputs and outputs is part of the plan. */
  plannedWithin?: InputMaybe<Scalars['ID']>;
  revisionId: Scalars['ID'];
};

/**
 * A lot or batch, defining a resource produced at the same time in the same way.
 * From DataFoodConsortium vocabulary https://datafoodconsortium.gitbook.io/dfc-standard-documentation/.
 */
export type ProductBatch = {
  __typename?: 'ProductBatch';
  /** The standard unique identifier of the batch. */
  batchNumber: Scalars['String'];
  /** Expiration date of the batch, commonly used for food. */
  expiryDate?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  meta: RecordMeta;
  /** Date the batch was produced.  Can be derived from the economic event of production. */
  productionDate?: Maybe<Scalars['DateTime']>;
  revision?: Maybe<ProductBatch>;
  revisionId: Scalars['ID'];
};


/**
 * A lot or batch, defining a resource produced at the same time in the same way.
 * From DataFoodConsortium vocabulary https://datafoodconsortium.gitbook.io/dfc-standard-documentation/.
 */
export type ProductBatchRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type ProductBatchConnection = {
  __typename?: 'ProductBatchConnection';
  edges: Array<ProductBatchEdge>;
  pageInfo: PageInfo;
};

export type ProductBatchCreateParams = {
  /** The standard unique identifier of the batch. */
  batchNumber: Scalars['String'];
  /** Expiration date of the batch, commonly used for food. */
  expiryDate?: InputMaybe<Scalars['DateTime']>;
  /** Date the batch was produced.  Can be derived from the economic event of production. */
  productionDate?: InputMaybe<Scalars['DateTime']>;
};

export type ProductBatchEdge = {
  __typename?: 'ProductBatchEdge';
  cursor: Scalars['String'];
  node: ProductBatch;
};

export type ProductBatchResponse = {
  __typename?: 'ProductBatchResponse';
  productBatch: ProductBatch;
};

export type ProductBatchUpdateParams = {
  /** The standard unique identifier of the batch. */
  batchNumber?: InputMaybe<Scalars['String']>;
  /** Expiration date of the batch, commonly used for food. */
  expiryDate?: InputMaybe<Scalars['DateTime']>;
  /** Date the batch was produced.  Can be derived from the economic event of production. */
  productionDate?: InputMaybe<Scalars['DateTime']>;
  revisionId: Scalars['ID'];
};

export type ProductionFlowItem = EconomicResource | Process;

/** Published requests or offers, sometimes with what is expected in return. */
export type Proposal = {
  __typename?: 'Proposal';
  /** The date and time the proposal was created. */
  created?: Maybe<Scalars['DateTime']>;
  /** Location or area where the proposal is valid. */
  eligibleLocation?: Maybe<SpatialThing>;
  /** The beginning time of proposal publication. */
  hasBeginning?: Maybe<Scalars['DateTime']>;
  /** The end time of proposal publication. */
  hasEnd?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: Maybe<Array<AccountingScope>>;
  meta: RecordMeta;
  /** An informal or formal textual identifier for a proposal. Does not imply uniqueness. */
  name?: Maybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  primaryIntents?: Maybe<Array<Intent>>;
  publishedTo?: Maybe<Array<ProposedTo>>;
  publishes?: Maybe<Array<ProposedIntent>>;
  reciprocalIntents?: Maybe<Array<Intent>>;
  revision?: Maybe<Proposal>;
  revisionId: Scalars['ID'];
  /** This proposal contains unit based quantities, which can be multiplied to create commitments; commonly seen in a price list or e-commerce. */
  unitBased?: Maybe<Scalars['Boolean']>;
};


/** Published requests or offers, sometimes with what is expected in return. */
export type ProposalRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type ProposalConnection = {
  __typename?: 'ProposalConnection';
  edges: Array<ProposalEdge>;
  pageInfo: PageInfo;
};

export type ProposalCreateParams = {
  /** The date and time the proposal was created. */
  created?: InputMaybe<Scalars['DateTime']>;
  /** (`SpatialThing`) The location at which this proposal is eligible. */
  eligibleLocation?: InputMaybe<Scalars['ID']>;
  /** The beginning time of proposal publication. */
  hasBeginning?: InputMaybe<Scalars['DateTime']>;
  /** The end time of proposal publication. */
  hasEnd?: InputMaybe<Scalars['DateTime']>;
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** An informal or formal textual identifier for a proposal. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** This proposal contains unit based quantities, which can be multipied to create commitments; commonly seen in a price list or e-commerce. */
  unitBased?: InputMaybe<Scalars['Boolean']>;
};

export type ProposalEdge = {
  __typename?: 'ProposalEdge';
  cursor: Scalars['String'];
  node: Proposal;
};

export type ProposalFilterParams = {
  active?: InputMaybe<Scalars['Boolean']>;
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  isOffer?: InputMaybe<Scalars['Boolean']>;
  isRequest?: InputMaybe<Scalars['Boolean']>;
};

export type ProposalResponse = {
  __typename?: 'ProposalResponse';
  proposal: Proposal;
};

export type ProposalUpdateParams = {
  /** (`SpatialThing`) The location at which this proposal is eligible. */
  eligibleLocation?: InputMaybe<Scalars['ID']>;
  /** The beginning date/time of proposal publication. */
  hasBeginning?: InputMaybe<Scalars['DateTime']>;
  /** The end time of proposal publication. */
  hasEnd?: InputMaybe<Scalars['DateTime']>;
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** An informal or formal textual identifier for a proposal. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  revisionId: Scalars['ID'];
  /** This proposal contains unit based quantities, which can be multipied to create commitments; commonly seen in a price list or e-commerce. */
  unitBased?: InputMaybe<Scalars['Boolean']>;
};

/** Represents many-to-many relationships between Proposals and Intents, supporting including intents in multiple proposals, as well as a proposal including multiple intents. */
export type ProposedIntent = {
  __typename?: 'ProposedIntent';
  id: Scalars['ID'];
  meta: RecordMeta;
  /** The published proposal which this intent is part of. */
  publishedIn: Proposal;
  /** The intent which is part of this published proposal. */
  publishes: Intent;
  /** This is a reciprocal intent of this proposal, not primary. Not meant to be used for intent matching. */
  reciprocal?: Maybe<Scalars['Boolean']>;
  revision?: Maybe<ProposedIntent>;
  revisionId: Scalars['ID'];
};


/** Represents many-to-many relationships between Proposals and Intents, supporting including intents in multiple proposals, as well as a proposal including multiple intents. */
export type ProposedIntentRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type ProposedIntentResponse = {
  __typename?: 'ProposedIntentResponse';
  proposedIntent: ProposedIntent;
};

/** An agent to which the proposal is to be published.  A proposal can be published to many agents. */
export type ProposedTo = {
  __typename?: 'ProposedTo';
  id: Scalars['ID'];
  meta: RecordMeta;
  /** The proposal that is published to a specific agent. */
  proposed: Proposal;
  /** The agent to which the proposal is published. */
  proposedTo: Agent;
  revision?: Maybe<ProposedTo>;
  revisionId: Scalars['ID'];
};


/** An agent to which the proposal is to be published.  A proposal can be published to many agents. */
export type ProposedToRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type ProposedToResponse = {
  __typename?: 'ProposedToResponse';
  proposedTo: ProposedTo;
};

export type Query = {
  __typename?: 'Query';
  action?: Maybe<Action>;
  actions?: Maybe<Array<Action>>;
  /** Find an agent (person or organization) by their ID */
  agent?: Maybe<Agent>;
  /** Retrieve details of an agent relationship by its ID */
  agentRelationship?: Maybe<AgentRelationship>;
  /** Retrieve details of an agent relationship role by its ID */
  agentRelationshipRole?: Maybe<AgentRelationshipRole>;
  /** Retrieve all possible kinds of associations that agents may have with one another in this collaboration space */
  agentRelationshipRoles: AgentRelationshipRoleConnection;
  /** Retrieve details of all the relationships between all agents registered in this collaboration space */
  agentRelationships: AgentRelationshipConnection;
  /** Loads all agents publicly registered within this collaboration space */
  agents: AgentConnection;
  agreement?: Maybe<Agreement>;
  agreements: AgreementConnection;
  appreciation: Appreciation;
  appreciations: AppreciationConnection;
  claim?: Maybe<Claim>;
  claims: ClaimConnection;
  commitment?: Maybe<Commitment>;
  commitments: CommitmentConnection;
  economicEvent?: Maybe<EconomicEvent>;
  economicEvents: EconomicEventConnection;
  economicResource?: Maybe<EconomicResource>;
  economicResources: EconomicResourceConnection;
  fulfillment?: Maybe<Fulfillment>;
  fulfillments: FulfillmentConnection;
  intent?: Maybe<Intent>;
  intents: IntentConnection;
  /** Loads details of the currently authenticated REA agent */
  myAgent?: Maybe<Agent>;
  /** List all proposals that are being listed as offers. */
  offers: ProposalConnection;
  /** Find an organization (group) agent by its ID */
  organization?: Maybe<Organization>;
  /** Loads all organizations publicly registered within this collaboration space */
  organizations: OrganizationConnection;
  /** Loads all people who have publicly registered with this collaboration space. */
  people: PersonConnection;
  /** Find a person by their ID */
  person?: Maybe<Person>;
  plan?: Maybe<Plan>;
  plans: PlanConnection;
  process?: Maybe<Process>;
  processSpecification?: Maybe<ProcessSpecification>;
  processSpecifications: ProcessSpecificationConnection;
  processes: ProcessConnection;
  productBatch?: Maybe<ProductBatch>;
  productBatches: ProductBatchConnection;
  proposal?: Maybe<Proposal>;
  proposals: ProposalConnection;
  recipeExchange?: Maybe<RecipeExchange>;
  recipeExchanges: RecipeExchangeConnection;
  recipeFlow?: Maybe<RecipeFlow>;
  recipeFlows: RecipeFlowConnection;
  recipeProcess?: Maybe<RecipeProcess>;
  recipeProcesses: RecipeProcessConnection;
  /** List all proposals that are being listed as requests. */
  requests: ProposalConnection;
  resourceSpecification?: Maybe<ResourceSpecification>;
  resourceSpecifications: ResourceSpecificationConnection;
  satisfaction?: Maybe<Satisfaction>;
  satisfactions: SatisfactionConnection;
  scenario?: Maybe<Scenario>;
  scenarioDefinition?: Maybe<ScenarioDefinition>;
  scenarioDefinitions: ScenarioDefinitionConnection;
  scenarios: ScenarioConnection;
  settlement?: Maybe<Settlement>;
  settlements: SettlementConnection;
  spatialThing?: Maybe<SpatialThing>;
  spatialThings: SpatialThingConnection;
  unit?: Maybe<Unit>;
  units: UnitConnection;
};


export type QueryActionArgs = {
  id: Scalars['ID'];
};


export type QueryAgentArgs = {
  id: Scalars['ID'];
};


export type QueryAgentRelationshipArgs = {
  id: Scalars['ID'];
};


export type QueryAgentRelationshipRoleArgs = {
  id: Scalars['ID'];
};


export type QueryAgentRelationshipRolesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryAgentRelationshipsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryAgentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryAgreementArgs = {
  id: Scalars['ID'];
};


export type QueryAgreementsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryAppreciationArgs = {
  id: Scalars['ID'];
};


export type QueryAppreciationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryClaimArgs = {
  id: Scalars['ID'];
};


export type QueryClaimsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ClaimFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryCommitmentArgs = {
  id: Scalars['ID'];
};


export type QueryCommitmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<CommitmentFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryEconomicEventArgs = {
  id: Scalars['ID'];
};


export type QueryEconomicEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<EconomicEventFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryEconomicResourceArgs = {
  id: Scalars['ID'];
};


export type QueryEconomicResourcesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryFulfillmentArgs = {
  id: Scalars['ID'];
};


export type QueryFulfillmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<FulfillmentFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryIntentArgs = {
  id: Scalars['ID'];
};


export type QueryIntentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<IntentFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<IntentsOrder>;
};


export type QueryOffersArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryOrganizationArgs = {
  id: Scalars['ID'];
};


export type QueryOrganizationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryPeopleArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<AgentFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryPersonArgs = {
  id: Scalars['ID'];
};


export type QueryPlanArgs = {
  id: Scalars['ID'];
};


export type QueryPlansArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryProcessArgs = {
  id: Scalars['ID'];
};


export type QueryProcessSpecificationArgs = {
  id: Scalars['ID'];
};


export type QueryProcessSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryProcessesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ProcessFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryProductBatchArgs = {
  id: Scalars['ID'];
};


export type QueryProductBatchesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryProposalArgs = {
  id: Scalars['ID'];
};


export type QueryProposalsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<ProposalFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryRecipeExchangeArgs = {
  id: Scalars['ID'];
};


export type QueryRecipeExchangesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryRecipeFlowArgs = {
  id: Scalars['ID'];
};


export type QueryRecipeFlowsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryRecipeProcessArgs = {
  id: Scalars['ID'];
};


export type QueryRecipeProcessesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryRequestsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryResourceSpecificationArgs = {
  id: Scalars['ID'];
};


export type QueryResourceSpecificationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QuerySatisfactionArgs = {
  id: Scalars['ID'];
};


export type QuerySatisfactionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  filter?: InputMaybe<SatisfactionFilterParams>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryScenarioArgs = {
  id: Scalars['ID'];
};


export type QueryScenarioDefinitionArgs = {
  id: Scalars['ID'];
};


export type QueryScenarioDefinitionsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryScenariosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QuerySettlementArgs = {
  id: Scalars['ID'];
};


export type QuerySettlementsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QuerySpatialThingArgs = {
  id: Scalars['ID'];
};


export type QuerySpatialThingsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


export type QueryUnitArgs = {
  id: Scalars['ID'];
};


export type QueryUnitsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

/** Specifies an exchange agreement as part of a recipe. */
export type RecipeExchange = {
  __typename?: 'RecipeExchange';
  id: Scalars['ID'];
  meta: RecordMeta;
  /** An informal or formal textual identifier for a recipe exchange. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  revision?: Maybe<RecipeExchange>;
  revisionId: Scalars['ID'];
};


/** Specifies an exchange agreement as part of a recipe. */
export type RecipeExchangeRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type RecipeExchangeConnection = {
  __typename?: 'RecipeExchangeConnection';
  edges: Array<RecipeExchangeEdge>;
  pageInfo: PageInfo;
};

export type RecipeExchangeCreateParams = {
  /** An informal or formal textual identifier for a recipe exchange. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
};

export type RecipeExchangeEdge = {
  __typename?: 'RecipeExchangeEdge';
  cursor: Scalars['String'];
  node: RecipeExchange;
};

export type RecipeExchangeResponse = {
  __typename?: 'RecipeExchangeResponse';
  recipeExchange: RecipeExchange;
};

export type RecipeExchangeUpdateParams = {
  /** An informal or formal textual identifier for a recipe exchange. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  revisionId: Scalars['ID'];
};

/** The specification of a resource inflow to, or outflow from, a recipe process. */
export type RecipeFlow = {
  __typename?: 'RecipeFlow';
  /** Relates a process input or output to a verb, such as consume, produce, work, modify, etc. */
  action: Action;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: Maybe<Measure>;
  id: Scalars['ID'];
  meta: RecordMeta;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  /** Relates a flow to its exchange agreement in a recipe. */
  recipeClauseOf?: Maybe<RecipeExchange>;
  /** Relates an input flow to its process in a recipe. */
  recipeInputOf?: Maybe<RecipeProcess>;
  /** Relates an output flow to its process in a recipe. */
  recipeOutputOf?: Maybe<RecipeProcess>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization. */
  resourceClassifiedAs?: Maybe<Array<Scalars['URI']>>;
  /** The resource definition referenced by this flow in the recipe. */
  resourceConformsTo: ResourceSpecification;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: Maybe<Measure>;
  revision?: Maybe<RecipeFlow>;
  revisionId: Scalars['ID'];
  /** The state of the desired economic resource (pass or fail), after coming out of a test or review process. */
  state?: Maybe<Scalars['String']>;
};


/** The specification of a resource inflow to, or outflow from, a recipe process. */
export type RecipeFlowRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type RecipeFlowConnection = {
  __typename?: 'RecipeFlowConnection';
  edges: Array<RecipeFlowEdge>;
  pageInfo: PageInfo;
};

export type RecipeFlowCreateParams = {
  /** (`Action`) Relates a process input or output to a verb, such as consume, produce, work, modify, etc. */
  action: Scalars['ID'];
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`RecipeExchange`) Relates a flow to its exchange agreement in a recipe. */
  recipeClauseOf?: InputMaybe<Scalars['ID']>;
  /** (`RecipeProcess`) Relates an input flow to its process in a recipe. */
  recipeInputOf?: InputMaybe<Scalars['ID']>;
  /** (`RecipeProcess`) Relates an output flow to its process in a recipe. */
  recipeOutputOf?: InputMaybe<Scalars['ID']>;
  /** (`ResourceSpecification`) The resource definition referenced by this flow in the recipe. */
  resourceConformsTo: Scalars['ID'];
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  /** (`ProcessSpecification`) References the ProcessSpecification of the last process the economic resource went through. Stage is used when the last process is important for finding proper resources, such as where the publishing process wants only documents that have gone through the editing process. */
  stage?: InputMaybe<Scalars['ID']>;
  /** The state of the desired economic resource (pass or fail), after coming out of a test or review process. */
  state?: InputMaybe<Scalars['String']>;
};

export type RecipeFlowEdge = {
  __typename?: 'RecipeFlowEdge';
  cursor: Scalars['String'];
  node: RecipeFlow;
};

export type RecipeFlowResponse = {
  __typename?: 'RecipeFlowResponse';
  recipeFlow: RecipeFlow;
};

export type RecipeFlowUpdateParams = {
  /** (`Action`) Relates a process input or output to a verb, such as consume, produce, work, modify, etc. */
  action?: InputMaybe<Scalars['ID']>;
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`RecipeExchange`) Relates a flow to its exchange agreement in a recipe. */
  recipeClauseOf?: InputMaybe<Scalars['ID']>;
  /** (`RecipeProcess`) Relates an input flow to its process in a recipe. */
  recipeInputOf?: InputMaybe<Scalars['ID']>;
  /** (`RecipeProcess`) Relates an output flow to its process in a recipe. */
  recipeOutputOf?: InputMaybe<Scalars['ID']>;
  /** (`ResourceSpecification`) The resource definition referenced by this flow in the recipe. */
  resourceConformsTo?: InputMaybe<Scalars['ID']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  revisionId: Scalars['ID'];
  /** (`ProcessSpecification`) References the ProcessSpecification of the last process the economic resource went through. Stage is used when the last process is important for finding proper resources, such as where the publishing process wants only documents that have gone through the editing process. */
  stage?: InputMaybe<Scalars['ID']>;
  /** The state of the desired economic resource (pass or fail), after coming out of a test or review process. */
  state?: InputMaybe<Scalars['String']>;
};

/** Specifies a process in a recipe for use in planning from recipe. */
export type RecipeProcess = {
  __typename?: 'RecipeProcess';
  /** Recipe process or definition that this process is based on. */
  basedOn?: Maybe<RecipeProcess>;
  /** The planned calendar duration of the process as defined for the recipe batch. */
  hasDuration?: Maybe<Duration>;
  id: Scalars['ID'];
  meta: RecordMeta;
  /** An informal or formal textual identifier for a recipe process. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization. */
  processClassifiedAs?: Maybe<Array<Scalars['URI']>>;
  /** The standard specification or definition of a process. */
  processConformsTo?: Maybe<ProcessSpecification>;
  revision?: Maybe<RecipeProcess>;
  revisionId: Scalars['ID'];
};


/** Specifies a process in a recipe for use in planning from recipe. */
export type RecipeProcessRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type RecipeProcessConnection = {
  __typename?: 'RecipeProcessConnection';
  edges: Array<RecipeProcessEdge>;
  pageInfo: PageInfo;
};

export type RecipeProcessCreateParams = {
  /** (`RecipeProcess`) Recipe process or definition that this process is based on. */
  basedOn?: InputMaybe<Scalars['ID']>;
  /** The planned calendar duration of the process as defined for the recipe batch. */
  hasDuration?: InputMaybe<IDuration>;
  /** An informal or formal textual identifier for a recipe process. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization. */
  processClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** (`ProcessSpecification`) The standard specification or definition of a process. */
  processConformsTo?: InputMaybe<Scalars['ID']>;
};

export type RecipeProcessEdge = {
  __typename?: 'RecipeProcessEdge';
  cursor: Scalars['String'];
  node: RecipeProcess;
};

export type RecipeProcessResponse = {
  __typename?: 'RecipeProcessResponse';
  recipeProcess: RecipeProcess;
};

export type RecipeProcessUpdateParams = {
  /** (`RecipeProcess`) Recipe process or definition that this process is based on. */
  basedOn?: InputMaybe<Scalars['ID']>;
  /** The planned calendar duration of the process as defined for the recipe batch. */
  hasDuration?: InputMaybe<IDuration>;
  /** An informal or formal textual identifier for a recipe process. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization. */
  processClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** (`ProcessSpecification`) The standard specification or definition of a process. */
  processConformsTo?: InputMaybe<Scalars['ID']>;
  revisionId: Scalars['ID'];
};

export type RecordMeta = {
  __typename?: 'RecordMeta';
  /** Number of newer revisions, if known. */
  futureRevisionsCount?: Maybe<Scalars['Int']>;
  /** Metadata regarding the most recent revision of this record, if able to be determined. */
  latestRevision?: Maybe<Revision>;
  /** Metadata about the previous revision of this record, queryable via `revision(previousRevision.id)`. If this is the first revision of a record, this field is empty. */
  previousRevision?: Maybe<Revision>;
  /** Number of older revisions, if known. */
  previousRevisionsCount?: Maybe<Scalars['Int']>;
  /** Metadata regarding the requested revision of this record. A record's `retrievedRevision.id` == `revisionId`. */
  retrievedRevision: Revision;
};

/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecification = {
  __typename?: 'ResourceSpecification';
  claims?: Maybe<ClaimConnection>;
  commitments?: Maybe<CommitmentConnection>;
  conformingResources?: Maybe<EconomicResourceConnection>;
  /** The default unit used for use or work. */
  defaultUnitOfEffort?: Maybe<Unit>;
  /** The default unit used for the resource itself. */
  defaultUnitOfResource?: Maybe<Unit>;
  economicEvents?: Maybe<EconomicEventConnection>;
  id: Scalars['ID'];
  /** The uri to an image relevant to the entity, such as a photo, diagram, etc. */
  image?: Maybe<Scalars['URI']>;
  /** URI addresses to images relevant to the type of resource. */
  imageList?: Maybe<Array<Scalars['URI']>>;
  intents?: Maybe<IntentConnection>;
  meta: RecordMeta;
  /** An informal or formal textual identifier for a type of resource. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: Maybe<Array<Scalars['URI']>>;
  revision?: Maybe<ResourceSpecification>;
  revisionId: Scalars['ID'];
  /** Defines if any resource of that type can be freely substituted for any other resource of that type when used, consumed, traded, etc. */
  substitutable?: Maybe<Scalars['Boolean']>;
};


/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecificationClaimsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecificationCommitmentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecificationConformingResourcesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecificationEconomicEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecificationIntentsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/**
 * Specification of a kind of resource. Could define a material item, service, digital item, currency account, etc.
 * Used instead of a classification when more information is needed, particularly for recipes.
 */
export type ResourceSpecificationRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type ResourceSpecificationConnection = {
  __typename?: 'ResourceSpecificationConnection';
  edges: Array<ResourceSpecificationEdge>;
  pageInfo: PageInfo;
};

export type ResourceSpecificationCreateParams = {
  /** (`Unit`) The default unit used for use or work. */
  defaultUnitOfEffort?: InputMaybe<Scalars['ID']>;
  /** (`Unit`) The default unit used for the resource itself. */
  defaultUnitOfResource?: InputMaybe<Scalars['ID']>;
  /** The uri to an image relevant to the entity, such as a photo, diagram, etc. */
  image?: InputMaybe<Scalars['URI']>;
  /** URI addresses to images relevant to the type of resource. */
  imageList?: InputMaybe<Array<Scalars['URI']>>;
  /** An informal or formal textual identifier for a type of resource. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  /** Defines if any resource of that type can be freely substituted for any other resource of that type when used, consumed, traded, etc. */
  substitutable?: InputMaybe<Scalars['Boolean']>;
};

export type ResourceSpecificationEdge = {
  __typename?: 'ResourceSpecificationEdge';
  cursor: Scalars['String'];
  node: ResourceSpecification;
};

export type ResourceSpecificationResponse = {
  __typename?: 'ResourceSpecificationResponse';
  resourceSpecification: ResourceSpecification;
};

export type ResourceSpecificationUpdateParams = {
  /** (`Unit`) The default unit used for use or work. */
  defaultUnitOfEffort?: InputMaybe<Scalars['ID']>;
  /** (`Unit`) The default unit used for the resource itself. */
  defaultUnitOfResource?: InputMaybe<Scalars['ID']>;
  /** The uri to an image relevant to the entity, such as a photo, diagram, etc. */
  image?: InputMaybe<Scalars['URI']>;
  /** URI addresses to images relevant to the type of resource. */
  imageList?: InputMaybe<Array<Scalars['URI']>>;
  /** An informal or formal textual identifier for a type of resource. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** References a concept in a common taxonomy or other classification scheme for purposes of categorization or grouping. */
  resourceClassifiedAs?: InputMaybe<Array<Scalars['URI']>>;
  revisionId: Scalars['ID'];
  /** Defines if any resource of that type can be freely substituted for any other resource of that type when used, consumed, traded, etc. */
  substitutable?: InputMaybe<Scalars['Boolean']>;
};

export type Revision = {
  __typename?: 'Revision';
  /** The authoring `Agent` who created this revision. */
  author?: Maybe<Agent>;
  /** ID of the revision, used to query a specific version of the related record. */
  id: Scalars['ID'];
  /** Time this revision was created, if known. */
  time?: Maybe<Scalars['DateTime']>;
};

/** Represents many-to-many relationships between intents and commitments or events that partially or full satisfy one or more intents. */
export type Satisfaction = {
  __typename?: 'Satisfaction';
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: Maybe<Measure>;
  id: Scalars['ID'];
  meta: RecordMeta;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: Maybe<Measure>;
  revision?: Maybe<Satisfaction>;
  revisionId: Scalars['ID'];
  /** A commitment or economic event fully or partially satisfying an intent. */
  satisfiedBy: EventOrCommitment;
  /** An intent satisfied fully or partially by an economic event or commitment. */
  satisfies: Intent;
};


/** Represents many-to-many relationships between intents and commitments or events that partially or full satisfy one or more intents. */
export type SatisfactionRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type SatisfactionConnection = {
  __typename?: 'SatisfactionConnection';
  edges: Array<SatisfactionEdge>;
  pageInfo: PageInfo;
};

export type SatisfactionCreateParams = {
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  /** (`Commitment`|`EconomicEvent`) A commitment or economic event fully or partially satisfying an intent. */
  satisfiedBy: Scalars['ID'];
  /** (`Intent`) An intent satisfied fully or partially by an economic event or commitment. */
  satisfies: Scalars['ID'];
};

export type SatisfactionEdge = {
  __typename?: 'SatisfactionEdge';
  cursor: Scalars['String'];
  node: Satisfaction;
};

export type SatisfactionFilterParams = {
  /** Match Satisfactions satisfied by any of the given EconomicEvents or Commitments */
  satisfiedBy?: InputMaybe<Array<Scalars['ID']>>;
  /** Match Satisfactions satisfying any of the given Intents */
  satisfies?: InputMaybe<Array<Scalars['ID']>>;
};

export type SatisfactionResponse = {
  __typename?: 'SatisfactionResponse';
  satisfaction: Satisfaction;
};

export type SatisfactionUpdateParams = {
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  revisionId: Scalars['ID'];
  /** (`Commitment`|`EconomicEvent`) A commitment or economic event fully or partially satisfying an intent. */
  satisfiedBy?: InputMaybe<Scalars['ID']>;
  /** (`Intent`) An intent satisfied fully or partially by an economic event or commitment. */
  satisfies?: InputMaybe<Scalars['ID']>;
};

/** An estimated or analytical logical collection of higher level processes used for budgeting, analysis, plan refinement, etc. */
export type Scenario = {
  __typename?: 'Scenario';
  /** The scenario definition for this scenario, for example yearly budget. */
  definedAs?: Maybe<ScenarioDefinition>;
  /** The beginning date/time of the scenario, often the beginning of an accounting period. */
  hasBeginning?: Maybe<Scalars['DateTime']>;
  /** The ending date/time of the scenario, often the end of an accounting period. */
  hasEnd?: Maybe<Scalars['DateTime']>;
  id: Scalars['ID'];
  /** Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: Maybe<Array<AccountingScope>>;
  meta: RecordMeta;
  /** An informal or formal textual identifier for a scenario. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  plans?: Maybe<Array<Plan>>;
  processes?: Maybe<ProcessConnection>;
  /** This scenario refines another scenario, often as time moves closer or for more detail. */
  refinementOf?: Maybe<Scenario>;
  refinements?: Maybe<Array<Scenario>>;
  revision?: Maybe<Scenario>;
  revisionId: Scalars['ID'];
};


/** An estimated or analytical logical collection of higher level processes used for budgeting, analysis, plan refinement, etc. */
export type ScenarioProcessesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** An estimated or analytical logical collection of higher level processes used for budgeting, analysis, plan refinement, etc. */
export type ScenarioRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type ScenarioConnection = {
  __typename?: 'ScenarioConnection';
  edges: Array<ScenarioEdge>;
  pageInfo: PageInfo;
};

export type ScenarioCreateParams = {
  /** (`ScenarioDefinition`) The scenario definition for this scenario, for example yearly budget. */
  definedAs?: InputMaybe<Scalars['ID']>;
  /** The beginning date/time of the scenario, often the beginning of an accounting period. */
  hasBeginning?: InputMaybe<Scalars['DateTime']>;
  /** The ending date/time of the scenario, often the end of an accounting period. */
  hasEnd?: InputMaybe<Scalars['DateTime']>;
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** An informal or formal textual identifier for a scenario. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Scenario`) This scenario refines another scenario, often as time moves closer or for more detail. */
  refinementOf?: InputMaybe<Scalars['ID']>;
};

/** The type definition of one or more scenarios, such as Yearly Budget. */
export type ScenarioDefinition = {
  __typename?: 'ScenarioDefinition';
  /** The duration of the scenario, often an accounting period. */
  hasDuration?: Maybe<Duration>;
  id: Scalars['ID'];
  meta: RecordMeta;
  /** An informal or formal textual identifier for a scenario definition. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  revision?: Maybe<ScenarioDefinition>;
  revisionId: Scalars['ID'];
  scenarios?: Maybe<ScenarioConnection>;
};


/** The type definition of one or more scenarios, such as Yearly Budget. */
export type ScenarioDefinitionRevisionArgs = {
  revisionId: Scalars['ID'];
};


/** The type definition of one or more scenarios, such as Yearly Budget. */
export type ScenarioDefinitionScenariosArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};

export type ScenarioDefinitionConnection = {
  __typename?: 'ScenarioDefinitionConnection';
  edges: Array<ScenarioDefinitionEdge>;
  pageInfo: PageInfo;
};

export type ScenarioDefinitionCreateParams = {
  /** The duration of the scenario, often an accounting period. */
  hasDuration?: InputMaybe<IDuration>;
  /** An informal or formal textual identifier for a scenario definition. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
};

export type ScenarioDefinitionEdge = {
  __typename?: 'ScenarioDefinitionEdge';
  cursor: Scalars['String'];
  node: ScenarioDefinition;
};

export type ScenarioDefinitionResponse = {
  __typename?: 'ScenarioDefinitionResponse';
  scenarioDefinition: ScenarioDefinition;
};

export type ScenarioDefinitionUpdateParams = {
  /** The duration of the scenario, often an accounting period. */
  hasDuration?: InputMaybe<IDuration>;
  /** An informal or formal textual identifier for a scenario definition. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  revisionId: Scalars['ID'];
};

export type ScenarioEdge = {
  __typename?: 'ScenarioEdge';
  cursor: Scalars['String'];
  node: Scenario;
};

export type ScenarioResponse = {
  __typename?: 'ScenarioResponse';
  scenario: Scenario;
};

export type ScenarioUpdateParams = {
  /** (`ScenarioDefinition`) The scenario definition for this scenario, for example yearly budget. */
  definedAs?: InputMaybe<Scalars['ID']>;
  /** The beginning date/time of the scenario, often the beginning of an accounting period. */
  hasBeginning?: InputMaybe<Scalars['DateTime']>;
  /** The ending date/time of the scenario, often the end of an accounting period. */
  hasEnd?: InputMaybe<Scalars['DateTime']>;
  /** (`AccountingScope`) Grouping around something to create a boundary or context, used for documenting, accounting, planning. */
  inScopeOf?: InputMaybe<Array<Scalars['ID']>>;
  /** An informal or formal textual identifier for a scenario. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** (`Scenario`) This scenario refines another scenario, often as time moves closer or for more detail. */
  refinementOf?: InputMaybe<Scalars['ID']>;
  revisionId: Scalars['ID'];
};

/** Represents many-to-many relationships between claim and economic events that fully or partially settle one or more claims. */
export type Settlement = {
  __typename?: 'Settlement';
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: Maybe<Measure>;
  id: Scalars['ID'];
  meta: RecordMeta;
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: Maybe<Measure>;
  revision?: Maybe<Settlement>;
  revisionId: Scalars['ID'];
  /** The economic event fully or partially settling a claim. */
  settledBy: EconomicEvent;
  /** A claim which is fully or partially settled by an economic event. */
  settles: Claim;
};


/** Represents many-to-many relationships between claim and economic events that fully or partially settle one or more claims. */
export type SettlementRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type SettlementConnection = {
  __typename?: 'SettlementConnection';
  edges: Array<SettlementEdge>;
  pageInfo: PageInfo;
};

export type SettlementCreateParams = {
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  /** (`EconomicEvent`) The economic event fully or partially settling a claim. */
  settledBy: Scalars['ID'];
  /** (`Claim`) A claim which is fully or partially settled by an economic event. */
  settles: Scalars['ID'];
};

export type SettlementEdge = {
  __typename?: 'SettlementEdge';
  cursor: Scalars['String'];
  node: Settlement;
};

export type SettlementResponse = {
  __typename?: 'SettlementResponse';
  settlement: Settlement;
};

export type SettlementUpdateParams = {
  /** The amount and unit of the work or use or citation effort-based action. This is often a time duration, but also could be cycle counts or other measures of effort or usefulness. */
  effortQuantity?: InputMaybe<IMeasure>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  /** The amount and unit of the economic resource counted or inventoried. */
  resourceQuantity?: InputMaybe<IMeasure>;
  revisionId: Scalars['ID'];
  /** (`EconomicEvent`) The economic event fully or partially settling a claim. */
  settledBy?: InputMaybe<Scalars['ID']>;
  /** (`Claim`) A claim which is fully or partially settled by an economic event. */
  settles?: InputMaybe<Scalars['ID']>;
};

export enum Sort {
  Asc = 'asc',
  Desc = 'desc'
}

/** A physical mappable location. */
export type SpatialThing = {
  __typename?: 'SpatialThing';
  agents?: Maybe<Array<Agent>>;
  /** Altitude. */
  alt?: Maybe<Scalars['Decimal']>;
  commitments?: Maybe<Array<Commitment>>;
  economicEvents?: Maybe<EconomicEventConnection>;
  economicResources?: Maybe<EconomicResourceConnection>;
  id: Scalars['ID'];
  intents?: Maybe<Array<Intent>>;
  /** Latitude. */
  lat?: Maybe<Scalars['Decimal']>;
  /** Longitude. */
  long?: Maybe<Scalars['Decimal']>;
  /** An address that will be recognized as mappable by mapping software. */
  mappableAddress?: Maybe<Scalars['String']>;
  meta: RecordMeta;
  /** An informal or formal textual identifier for a location. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: Maybe<Scalars['String']>;
  revision?: Maybe<SpatialThing>;
  revisionId: Scalars['ID'];
};


/** A physical mappable location. */
export type SpatialThingEconomicEventsArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A physical mappable location. */
export type SpatialThingEconomicResourcesArgs = {
  after?: InputMaybe<Scalars['String']>;
  before?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  last?: InputMaybe<Scalars['Int']>;
};


/** A physical mappable location. */
export type SpatialThingRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type SpatialThingConnection = {
  __typename?: 'SpatialThingConnection';
  edges: Array<SpatialThingEdge>;
  pageInfo: PageInfo;
};

export type SpatialThingCreateParams = {
  /** Altitude. */
  alt?: InputMaybe<Scalars['Decimal']>;
  /** Latitude. */
  lat?: InputMaybe<Scalars['Decimal']>;
  /** Longitude. */
  long?: InputMaybe<Scalars['Decimal']>;
  /** An address that will be recognized as mappable by mapping software. */
  mappableAddress?: InputMaybe<Scalars['String']>;
  /** An informal or formal textual identifier for a location. Does not imply uniqueness. */
  name: Scalars['String'];
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
};

export type SpatialThingEdge = {
  __typename?: 'SpatialThingEdge';
  cursor: Scalars['String'];
  node: SpatialThing;
};

export type SpatialThingResponse = {
  __typename?: 'SpatialThingResponse';
  spatialThing: SpatialThing;
};

export type SpatialThingUpdateParams = {
  /** Altitude. */
  alt?: InputMaybe<Scalars['Decimal']>;
  /** Latitude. */
  lat?: InputMaybe<Scalars['Decimal']>;
  /** Longitude. */
  long?: InputMaybe<Scalars['Decimal']>;
  /** An address that will be recognized as mappable by mapping software. */
  mappableAddress?: InputMaybe<Scalars['String']>;
  /** An informal or formal textual identifier for a location. Does not imply uniqueness. */
  name?: InputMaybe<Scalars['String']>;
  /** A textual description or comment. */
  note?: InputMaybe<Scalars['String']>;
  revisionId: Scalars['ID'];
};

/** Defines the unit of time measured in a temporal `Duration`. */
export enum TimeUnit {
  Day = 'day',
  Hour = 'hour',
  Minute = 'minute',
  Month = 'month',
  Second = 'second',
  Week = 'week',
  Year = 'year'
}

export type TrackTraceItem = EconomicEvent | EconomicResource | Process;

/**
 * Defines a unit of measurement, along with its display symbol.
 * From OM2 vocabulary.
 */
export type Unit = {
  __typename?: 'Unit';
  id: Scalars['ID'];
  /** A human readable label for the unit, can be language specific. */
  label: Scalars['String'];
  meta: RecordMeta;
  revision?: Maybe<Unit>;
  revisionId: Scalars['ID'];
  /** A standard display symbol for a unit of measure. */
  symbol: Scalars['String'];
};


/**
 * Defines a unit of measurement, along with its display symbol.
 * From OM2 vocabulary.
 */
export type UnitRevisionArgs = {
  revisionId: Scalars['ID'];
};

export type UnitConnection = {
  __typename?: 'UnitConnection';
  edges: Array<UnitEdge>;
  pageInfo: PageInfo;
};

export type UnitCreateParams = {
  /** A human readable label for the unit, can be language specific. */
  label: Scalars['String'];
  /** A standard display symbol for a unit of measure. */
  symbol: Scalars['String'];
};

export type UnitEdge = {
  __typename?: 'UnitEdge';
  cursor: Scalars['String'];
  node: Unit;
};

export type UnitResponse = {
  __typename?: 'UnitResponse';
  unit: Unit;
};

export type UnitUpdateParams = {
  /** A human readable label for the unit, can be language specific. */
  label?: InputMaybe<Scalars['String']>;
  revisionId: Scalars['ID'];
  /** A standard display symbol for a unit of measure. */
  symbol?: InputMaybe<Scalars['String']>;
};

/** Query parameters for reading `Proposal`s related to an `Agent` */
export type AgentProposalSearchParams = {
  searchString?: InputMaybe<Scalars['String']>;
};
