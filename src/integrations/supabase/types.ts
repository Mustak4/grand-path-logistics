export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          adresa: string
          created_at: string
          id: string
          ime: string
          lat: number | null
          lng: number | null
          naseleno_mesto: string
          telefon: string | null
          tip_naplata: Database["public"]["Enums"]["tip_naplata"]
          updated_at: string
          zabeleshka: string | null
        }
        Insert: {
          adresa: string
          created_at?: string
          id?: string
          ime: string
          lat?: number | null
          lng?: number | null
          naseleno_mesto: string
          telefon?: string | null
          tip_naplata: Database["public"]["Enums"]["tip_naplata"]
          updated_at?: string
          zabeleshka?: string | null
        }
        Update: {
          adresa?: string
          created_at?: string
          id?: string
          ime?: string
          lat?: number | null
          lng?: number | null
          naseleno_mesto?: string
          telefon?: string | null
          tip_naplata?: Database["public"]["Enums"]["tip_naplata"]
          updated_at?: string
          zabeleshka?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          kolicina: number
          naracka_id: string
          produkt_id: string
        }
        Insert: {
          id?: string
          kolicina: number
          naracka_id: string
          produkt_id: string
        }
        Update: {
          id?: string
          kolicina?: number
          naracka_id?: string
          produkt_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_naracka_id_fkey"
            columns: ["naracka_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_produkt_id_fkey"
            columns: ["produkt_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          datum: string
          id: string
          klient_id: string
          metod_plakanje: Database["public"]["Enums"]["metod_plakanje"]
          suma: number
          tip_naplata: Database["public"]["Enums"]["tip_naplata"]
          updated_at: string
          zabeleshka: string | null
        }
        Insert: {
          created_at?: string
          datum?: string
          id?: string
          klient_id: string
          metod_plakanje: Database["public"]["Enums"]["metod_plakanje"]
          suma: number
          tip_naplata: Database["public"]["Enums"]["tip_naplata"]
          updated_at?: string
          zabeleshka?: string | null
        }
        Update: {
          created_at?: string
          datum?: string
          id?: string
          klient_id?: string
          metod_plakanje?: Database["public"]["Enums"]["metod_plakanje"]
          suma?: number
          tip_naplata?: Database["public"]["Enums"]["tip_naplata"]
          updated_at?: string
          zabeleshka?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_klient_id_fkey"
            columns: ["klient_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          cena_po_edinica: number
          created_at: string
          edinica: string
          id: string
          ime: string
          tezina_kg: number | null
          updated_at: string
        }
        Insert: {
          cena_po_edinica: number
          created_at?: string
          edinica: string
          id?: string
          ime: string
          tezina_kg?: number | null
          updated_at?: string
        }
        Update: {
          cena_po_edinica?: number
          created_at?: string
          edinica?: string
          id?: string
          ime?: string
          tezina_kg?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          ime: string
          telefon: string | null
          uloga: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          ime?: string
          telefon?: string | null
          uloga?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ime?: string
          telefon?: string | null
          uloga?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string
          datum: string
          id: string
          status: Database["public"]["Enums"]["ruta_status"]
          updated_at: string
          vozac_id: string | null
          vozilo: string | null
        }
        Insert: {
          created_at?: string
          datum: string
          id?: string
          status?: Database["public"]["Enums"]["ruta_status"]
          updated_at?: string
          vozac_id?: string | null
          vozilo?: string | null
        }
        Update: {
          created_at?: string
          datum?: string
          id?: string
          status?: Database["public"]["Enums"]["ruta_status"]
          updated_at?: string
          vozac_id?: string | null
          vozilo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_vozac_id_fkey"
            columns: ["vozac_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stops: {
        Row: {
          created_at: string
          eta: string | null
          id: string
          naracka_id: string
          redosled: number
          ruta_id: string
          status: Database["public"]["Enums"]["stop_status"]
          suma_za_naplata: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          eta?: string | null
          id?: string
          naracka_id: string
          redosled: number
          ruta_id: string
          status?: Database["public"]["Enums"]["stop_status"]
          suma_za_naplata: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          eta?: string | null
          id?: string
          naracka_id?: string
          redosled?: number
          ruta_id?: string
          status?: Database["public"]["Enums"]["stop_status"]
          suma_za_naplata?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stops_naracka_id_fkey"
            columns: ["naracka_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stops_ruta_id_fkey"
            columns: ["ruta_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      metod_plakanje: "gotovo" | "transakcija"
      ruta_status: "draft" | "aktivna" | "zavrsena"
      stop_status: "na_cekane" | "zavrseno" | "preskoknato"
      tip_naplata: "fiskalna" | "faktura"
      user_role: "dispecer" | "vozac"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      metod_plakanje: ["gotovo", "transakcija"],
      ruta_status: ["draft", "aktivna", "zavrsena"],
      stop_status: ["na_cekane", "zavrseno", "preskoknato"],
      tip_naplata: ["fiskalna", "faktura"],
      user_role: ["dispecer", "vozac"],
    },
  },
} as const
