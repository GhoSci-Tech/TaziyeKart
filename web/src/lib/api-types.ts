export type UserRole = 'SUPERADMIN' | 'FUNERAL_HOME';
export type Plan = 'TRIAL' | 'SINGLE' | 'MONTHLY';
export type HomeStatus = 'ACTIVE' | 'SUSPENDED';
export type CondolenceStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PanelHome = {
  id: string;
  name: string;
  phone: string | null;
  plan: Plan;
  status: HomeStatus;
};

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  funeralHomeId: string | null;
  funeralHome: PanelHome | null;
};

export type PanelCard = {
  id: string;
  deceasedName: string;
  honorific: string | null;
  funeralPlace: string;
  funeralAddress: string | null;
  funeralMapUrl: string | null;
  funeralDate: string;
  funeralTime: string;
  cemeteryName: string | null;
  burialTime: string | null;
  condolenceAddress: string | null;
  condolenceHours: string | null;
  donationUrl: string | null;
  donationIban: string | null;
  note: string | null;
  published: boolean;
  slug: string;
  editToken: string;
  publicPath: string;
  editPath: string;
  pendingMessages: number;
  createdAt: string;
  updatedAt: string;
};

export type RecentCard = {
  id: string;
  deceasedName: string;
  slug: string;
  funeralDate: string;
  funeralTime: string;
  published: boolean;
};

export type PanelOverview = {
  home: PanelHome;
  usage: {
    cards: number;
    limit: number | null;
    messagesPending: number;
  };
  recentCards: RecentCard[];
};

export type PanelMessage = {
  id: string;
  cardId: string;
  card: {
    deceasedName: string;
    slug: string;
  };
  name: string;
  message: string;
  status: CondolenceStatus;
  createdAt: string;
};

export type CheckoutResponse = {
  home: PanelHome;
  demo: boolean;
  message: string;
};

export type PublicCondolence = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
};

export type PublicCard = {
  slug: string;
  deceasedName: string;
  honorific: string | null;
  funeralPlace: string;
  funeralAddress: string | null;
  funeralMapUrl: string | null;
  funeralDate: string;
  funeralTime: string;
  cemeteryName: string | null;
  burialTime: string | null;
  condolenceAddress: string | null;
  condolenceHours: string | null;
  donationUrl: string | null;
  donationIban: string | null;
  note: string | null;
  home: {
    name: string;
    phone: string | null;
  };
  condolences: PublicCondolence[];
};

export type FamilyCard = {
  slug: string;
  publicPath: string;
  deceasedName: string;
  honorific: string | null;
  funeralPlace: string;
  funeralAddress: string | null;
  funeralMapUrl: string | null;
  funeralDate: string;
  funeralTime: string;
  cemeteryName: string | null;
  burialTime: string | null;
  condolenceAddress: string | null;
  condolenceHours: string | null;
  donationUrl: string | null;
  donationIban: string | null;
  note: string | null;
  published: boolean;
  home: {
    name: string;
    phone: string | null;
  };
};

export type FamilyCondolence = {
  id: string;
  name: string;
  message: string;
  status: CondolenceStatus;
  createdAt: string;
};

export type FamilyEditData = {
  card: FamilyCard;
  condolences: FamilyCondolence[];
};

export type AdminStats = {
  homes: { total: number; active: number; suspended: number };
  cards: { total: number; published: number; unpublished: number };
  messages: { pending: number; approved: number; rejected: number };
  demoMrrTry: number;
};

export type AdminHome = {
  id: string;
  name: string;
  phone: string | null;
  plan: Plan;
  status: HomeStatus;
  cardsCount: number;
  usersCount: number;
  pendingMessages: number;
  createdAt: string;
};

export type AdminHomeUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
};

export type AdminCard = {
  id: string;
  deceasedName: string;
  honorific: string | null;
  funeralDate: string;
  funeralTime: string;
  published: boolean;
  slug: string;
  publicPath: string;
  home: { id: string; name: string };
  pendingMessages: number;
  createdAt: string;
};

export type AdminHomeDetail = {
  home: AdminHome;
  users: AdminHomeUser[];
  cards: AdminCard[];
  messageCounts: { pending: number; approved: number; rejected: number };
};

export type AdminMessage = {
  id: string;
  cardId: string;
  card: { id: string; deceasedName: string; slug: string };
  home: { id: string; name: string };
  name: string;
  message: string;
  status: CondolenceStatus;
  createdAt: string;
};

export type AdminAudit = {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  meta: Record<string, unknown> | null;
  actor: { id: string; name: string; email: string } | null;
  createdAt: string;
};
