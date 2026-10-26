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
