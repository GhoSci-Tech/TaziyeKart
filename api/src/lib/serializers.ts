import type { Card, Condolence, FuneralHome, User } from '@prisma/client';

type HomeContact = Pick<FuneralHome, 'name' | 'phone'>;
type HomeSummary = Pick<FuneralHome, 'id' | 'name' | 'phone' | 'plan' | 'status'>;
type PublicCondolence = Pick<Condolence, 'id' | 'name' | 'message' | 'createdAt'>;
type UserWithHome = Pick<User, 'id' | 'email' | 'name' | 'role' | 'funeralHomeId'> & {
  funeralHome: HomeSummary | null;
};

export function toHome(home: HomeSummary) {
  return {
    id: home.id,
    name: home.name,
    phone: home.phone,
    plan: home.plan,
    status: home.status,
  };
}

export function toUser(user: UserWithHome) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    funeralHomeId: user.funeralHomeId,
    funeralHome: user.funeralHome ? toHome(user.funeralHome) : null,
  };
}

export function toPublicCondolence(message: PublicCondolence) {
  return {
    id: message.id,
    name: message.name,
    message: message.message,
    createdAt: message.createdAt,
  };
}

export function toPublicCard(
  card: Card & { funeralHome: HomeContact; condolences: PublicCondolence[] },
) {
  return {
    slug: card.slug,
    deceasedName: card.deceasedName,
    honorific: card.honorific,
    funeralPlace: card.funeralPlace,
    funeralAddress: card.funeralAddress,
    funeralMapUrl: card.funeralMapUrl,
    funeralDate: card.funeralDate,
    funeralTime: card.funeralTime,
    cemeteryName: card.cemeteryName,
    burialTime: card.burialTime,
    condolenceAddress: card.condolenceAddress,
    condolenceHours: card.condolenceHours,
    donationUrl: card.donationUrl,
    donationIban: card.donationIban,
    note: card.note,
    home: {
      name: card.funeralHome.name,
      phone: card.funeralHome.phone,
    },
    condolences: card.condolences.map(toPublicCondolence),
  };
}

export function toPanelCard(card: Card & { _count?: { condolences: number } }) {
  return {
    id: card.id,
    deceasedName: card.deceasedName,
    honorific: card.honorific,
    funeralPlace: card.funeralPlace,
    funeralAddress: card.funeralAddress,
    funeralMapUrl: card.funeralMapUrl,
    funeralDate: card.funeralDate,
    funeralTime: card.funeralTime,
    cemeteryName: card.cemeteryName,
    burialTime: card.burialTime,
    condolenceAddress: card.condolenceAddress,
    condolenceHours: card.condolenceHours,
    donationUrl: card.donationUrl,
    donationIban: card.donationIban,
    note: card.note,
    published: card.published,
    slug: card.slug,
    editToken: card.editToken,
    publicPath: `/k/${card.slug}`,
    editPath: `/duzenle/${card.editToken}`,
    pendingMessages: card._count?.condolences ?? 0,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  };
}

export function toEditCard(card: Card & { funeralHome: HomeContact }) {
  return {
    slug: card.slug,
    publicPath: `/k/${card.slug}`,
    deceasedName: card.deceasedName,
    honorific: card.honorific,
    funeralPlace: card.funeralPlace,
    funeralAddress: card.funeralAddress,
    funeralMapUrl: card.funeralMapUrl,
    funeralDate: card.funeralDate,
    funeralTime: card.funeralTime,
    cemeteryName: card.cemeteryName,
    burialTime: card.burialTime,
    condolenceAddress: card.condolenceAddress,
    condolenceHours: card.condolenceHours,
    donationUrl: card.donationUrl,
    donationIban: card.donationIban,
    note: card.note,
    published: card.published,
    home: {
      name: card.funeralHome.name,
      phone: card.funeralHome.phone,
    },
  };
}

type PanelMessageWithCard = Condolence & {
  card: Pick<Card, 'deceasedName' | 'slug'>;
};

export function toPanelMessage(message: PanelMessageWithCard) {
  return {
    id: message.id,
    cardId: message.cardId,
    card: {
      deceasedName: message.card.deceasedName,
      slug: message.card.slug,
    },
    name: message.name,
    message: message.message,
    status: message.status,
    createdAt: message.createdAt,
  };
}

type EditCondolence = Pick<Condolence, 'id' | 'name' | 'message' | 'status' | 'createdAt'>;

export function toEditCondolence(message: EditCondolence) {
  return {
    id: message.id,
    name: message.name,
    message: message.message,
    status: message.status,
    createdAt: message.createdAt,
  };
}
