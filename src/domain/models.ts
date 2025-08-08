// Домен модели за „Гранд Партнер АС“ — интерна логистика
// Сите типови се само фронтенд-структура (без Supabase имплементација сè уште)

export type ID = string;

export type UserRole = "dispecer" | "vozac";

export interface UserProfile {
  id: ID;
  ime: string;
  telefon?: string;
  uloga: UserRole;
}

export interface Klient {
  id: ID;
  ime: string;
  naselenoMesto: string;
  adresa: string;
  lokacija?: { lat: number; lng: number };
  telefon?: string;
  tipNaplatа: "fiskalna" | "faktura";
  zabeleshka?: string;
}

export interface Produkt {
  id: ID;
  ime: string;
  edinica: "kg" | "paket" | string;
  cenaPoEdinica: number; // во денари
  tezinaKg?: number; // тежина по единица
}

export interface NarackaItem {
  produktId: ID;
  kolicina: number;
}

export interface Naracka {
  id: ID;
  klientId: ID;
  datum: string; // ISO датум
  tipNaplata: "fiskalna" | "faktura";
  metodPlakanje: "gotovo" | "transakcija";
  suma: number; // вкупно за наплата
  zabeleshka?: string;
  items: NarackaItem[];
}

export type RutaStatus = "draft" | "aktivna" | "zavrsena";

export interface Ruta {
  id: ID;
  datum: string; // ISO датум на тура
  vozacId: ID; // UserProfile (vozac)
  vozilo?: string;
  status: RutaStatus;
}

export type StopStatus = "na_cekane" | "zavrseno" | "preskoknato";

export interface Stop {
  id: ID;
  rutaId: ID;
  narackaId: ID; // секој стоп е една нарачка
  redosled: number; // реден број
  status: StopStatus;
  eta?: string; // ISO време
  sumaZaNaplata: number; // парите за тој стоп
}

// Составни погледи (use-case помошни типови)
export interface DenesnaRutaZaVozac {
  ruta: Ruta;
  stopovi: Array<{
    stop: Stop;
    naracka: Naracka;
    klient: Klient;
  }>;
  vkupnoZaNaplata: number;
}
