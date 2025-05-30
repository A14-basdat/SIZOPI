export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  sizopi: {
    Tables: {
      adopsi: {
        Row: {
          id_adopter: string
          id_hewan: string
          kontribusi_finansial: number
          status_pembayaran: string
          tgl_berhenti_adopsi: string
          tgl_mulai_adopsi: string
        }
        Insert: {
          id_adopter: string
          id_hewan: string
          kontribusi_finansial: number
          status_pembayaran: string
          tgl_berhenti_adopsi: string
          tgl_mulai_adopsi: string
        }
        Update: {
          id_adopter?: string
          id_hewan?: string
          kontribusi_finansial?: number
          status_pembayaran?: string
          tgl_berhenti_adopsi?: string
          tgl_mulai_adopsi?: string
        }
        Relationships: [
          {
            foreignKeyName: "adopsi_id_adopter_fkey"
            columns: ["id_adopter"]
            isOneToOne: false
            referencedRelation: "adopter"
            referencedColumns: ["id_adopter"]
          },
          {
            foreignKeyName: "adopsi_id_hewan_fkey"
            columns: ["id_hewan"]
            isOneToOne: false
            referencedRelation: "hewan"
            referencedColumns: ["id"]
          },
        ]
      }
      adopter: {
        Row: {
          id_adopter: string
          total_kontribusi: number
          username_adopter: string | null
        }
        Insert: {
          id_adopter: string
          total_kontribusi: number
          username_adopter?: string | null
        }
        Update: {
          id_adopter?: string
          total_kontribusi?: number
          username_adopter?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adopter_username_adopter_fkey"
            columns: ["username_adopter"]
            isOneToOne: true
            referencedRelation: "pengunjung"
            referencedColumns: ["username_p"]
          },
        ]
      }
      atraksi: {
        Row: {
          lokasi: string
          nama_atraksi: string
        }
        Insert: {
          lokasi: string
          nama_atraksi: string
        }
        Update: {
          lokasi?: string
          nama_atraksi?: string
        }
        Relationships: [
          {
            foreignKeyName: "atraksi_nama_atraksi_fkey"
            columns: ["nama_atraksi"]
            isOneToOne: true
            referencedRelation: "fasilitas"
            referencedColumns: ["nama"]
          },
        ]
      }
      berpartisipasi: {
        Row: {
          id_hewan: string
          nama_fasilitas: string
        }
        Insert: {
          id_hewan: string
          nama_fasilitas: string
        }
        Update: {
          id_hewan?: string
          nama_fasilitas?: string
        }
        Relationships: [
          {
            foreignKeyName: "berpartisipasi_id_hewan_fkey"
            columns: ["id_hewan"]
            isOneToOne: false
            referencedRelation: "hewan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "berpartisipasi_nama_fasilitas_fkey"
            columns: ["nama_fasilitas"]
            isOneToOne: false
            referencedRelation: "fasilitas"
            referencedColumns: ["nama"]
          },
        ]
      }
      catatan_medis: {
        Row: {
          catatan_tindak_lanjut: string | null
          diagnosis: string | null
          id_hewan: string
          pengobatan: string | null
          status_kesehatan: string
          tanggal_pemeriksaan: string
          username_dh: string | null
        }
        Insert: {
          catatan_tindak_lanjut?: string | null
          diagnosis?: string | null
          id_hewan: string
          pengobatan?: string | null
          status_kesehatan: string
          tanggal_pemeriksaan: string
          username_dh?: string | null
        }
        Update: {
          catatan_tindak_lanjut?: string | null
          diagnosis?: string | null
          id_hewan?: string
          pengobatan?: string | null
          status_kesehatan?: string
          tanggal_pemeriksaan?: string
          username_dh?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catatan_medis_id_hewan_fkey"
            columns: ["id_hewan"]
            isOneToOne: false
            referencedRelation: "hewan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catatan_medis_username_dh_fkey"
            columns: ["username_dh"]
            isOneToOne: false
            referencedRelation: "dokter_hewan"
            referencedColumns: ["username_dh"]
          },
        ]
      }
      dokter_hewan: {
        Row: {
          no_str: string
          username_dh: string
        }
        Insert: {
          no_str: string
          username_dh: string
        }
        Update: {
          no_str?: string
          username_dh?: string
        }
        Relationships: [
          {
            foreignKeyName: "dokter_hewan_username_dh_fkey"
            columns: ["username_dh"]
            isOneToOne: true
            referencedRelation: "pengguna"
            referencedColumns: ["username"]
          },
        ]
      }
      fasilitas: {
        Row: {
          jadwal: string
          kapasitas_max: number
          nama: string
        }
        Insert: {
          jadwal: string
          kapasitas_max: number
          nama: string
        }
        Update: {
          jadwal?: string
          kapasitas_max?: number
          nama?: string
        }
        Relationships: []
      }
      habitat: {
        Row: {
          kapasitas: number
          luas_area: number
          nama: string
          status: string
        }
        Insert: {
          kapasitas: number
          luas_area: number
          nama: string
          status: string
        }
        Update: {
          kapasitas?: number
          luas_area?: number
          nama?: string
          status?: string
        }
        Relationships: []
      }
      hewan: {
        Row: {
          asal_hewan: string
          id: string
          nama: string | null
          nama_habitat: string | null
          spesies: string
          status_kesehatan: string
          tanggal_lahir: string | null
          url_foto: string
        }
        Insert: {
          asal_hewan: string
          id: string
          nama?: string | null
          nama_habitat?: string | null
          spesies: string
          status_kesehatan: string
          tanggal_lahir?: string | null
          url_foto: string
        }
        Update: {
          asal_hewan?: string
          id?: string
          nama?: string | null
          nama_habitat?: string | null
          spesies?: string
          status_kesehatan?: string
          tanggal_lahir?: string | null
          url_foto?: string
        }
        Relationships: [
          {
            foreignKeyName: "hewan_nama_habitat_fkey"
            columns: ["nama_habitat"]
            isOneToOne: false
            referencedRelation: "habitat"
            referencedColumns: ["nama"]
          },
        ]
      }
      individu: {
        Row: {
          id_adopter: string | null
          nama: string
          nik: string
        }
        Insert: {
          id_adopter?: string | null
          nama: string
          nik: string
        }
        Update: {
          id_adopter?: string | null
          nama?: string
          nik?: string
        }
        Relationships: [
          {
            foreignKeyName: "individu_id_adopter_fkey"
            columns: ["id_adopter"]
            isOneToOne: false
            referencedRelation: "adopter"
            referencedColumns: ["id_adopter"]
          },
        ]
      }
      jadwal_pemeriksaan_kesehatan: {
        Row: {
          freq_pemeriksaan_rutin: number
          id_hewan: string
          tgl_pemeriksaan_selanjutnya: string
        }
        Insert: {
          freq_pemeriksaan_rutin: number
          id_hewan: string
          tgl_pemeriksaan_selanjutnya: string
        }
        Update: {
          freq_pemeriksaan_rutin?: number
          id_hewan?: string
          tgl_pemeriksaan_selanjutnya?: string
        }
        Relationships: [
          {
            foreignKeyName: "jadwal_pemeriksaan_kesehatan_id_hewan_fkey"
            columns: ["id_hewan"]
            isOneToOne: false
            referencedRelation: "hewan"
            referencedColumns: ["id"]
          },
        ]
      }
      jadwal_penugasan: {
        Row: {
          nama_atraksi: string
          tgl_penugasan: string
          username_lh: string
        }
        Insert: {
          nama_atraksi: string
          tgl_penugasan: string
          username_lh: string
        }
        Update: {
          nama_atraksi?: string
          tgl_penugasan?: string
          username_lh?: string
        }
        Relationships: [
          {
            foreignKeyName: "jadwal_penugasan_nama_atraksi_fkey"
            columns: ["nama_atraksi"]
            isOneToOne: false
            referencedRelation: "atraksi"
            referencedColumns: ["nama_atraksi"]
          },
          {
            foreignKeyName: "jadwal_penugasan_username_lh_fkey"
            columns: ["username_lh"]
            isOneToOne: false
            referencedRelation: "pelatih_hewan"
            referencedColumns: ["username_lh"]
          },
        ]
      }
      memberi: {
        Row: {
          id_hewan: string
          jadwal: string
          username_jh: string
        }
        Insert: {
          id_hewan: string
          jadwal: string
          username_jh: string
        }
        Update: {
          id_hewan?: string
          jadwal?: string
          username_jh?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberi_id_hewan_fkey"
            columns: ["id_hewan"]
            isOneToOne: true
            referencedRelation: "hewan"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "memberi_username_jh_fkey"
            columns: ["username_jh"]
            isOneToOne: false
            referencedRelation: "penjaga_hewan"
            referencedColumns: ["username_jh"]
          },
        ]
      }
      organisasi: {
        Row: {
          id_adopter: string | null
          nama_organisasi: string
          npp: string
        }
        Insert: {
          id_adopter?: string | null
          nama_organisasi: string
          npp: string
        }
        Update: {
          id_adopter?: string | null
          nama_organisasi?: string
          npp?: string
        }
        Relationships: [
          {
            foreignKeyName: "organisasi_id_adopter_fkey"
            columns: ["id_adopter"]
            isOneToOne: false
            referencedRelation: "adopter"
            referencedColumns: ["id_adopter"]
          },
        ]
      }
      pakan: {
        Row: {
          id_hewan: string
          jadwal: string
          jenis: string
          jumlah: number
          status: string
        }
        Insert: {
          id_hewan: string
          jadwal: string
          jenis: string
          jumlah: number
          status: string
        }
        Update: {
          id_hewan?: string
          jadwal?: string
          jenis?: string
          jumlah?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pakan_id_hewan_fkey"
            columns: ["id_hewan"]
            isOneToOne: false
            referencedRelation: "hewan"
            referencedColumns: ["id"]
          },
        ]
      }
      pelatih_hewan: {
        Row: {
          id_staf: string
          username_lh: string
        }
        Insert: {
          id_staf: string
          username_lh: string
        }
        Update: {
          id_staf?: string
          username_lh?: string
        }
        Relationships: [
          {
            foreignKeyName: "pelatih_hewan_username_lh_fkey"
            columns: ["username_lh"]
            isOneToOne: true
            referencedRelation: "pengguna"
            referencedColumns: ["username"]
          },
        ]
      }
      pengguna: {
        Row: {
          email: string
          hashed_password: string
          id: string | null
          nama_belakang: string
          nama_depan: string
          nama_tengah: string | null
          no_telepon: string
          password: string
          permission_level: number | null
          username: string
        }
        Insert: {
          email: string
          hashed_password?: string
          id?: string | null
          nama_belakang: string
          nama_depan: string
          nama_tengah?: string | null
          no_telepon: string
          password: string
          permission_level?: number | null
          username: string
        }
        Update: {
          email?: string
          hashed_password?: string
          id?: string | null
          nama_belakang?: string
          nama_depan?: string
          nama_tengah?: string | null
          no_telepon?: string
          password?: string
          permission_level?: number | null
          username?: string
        }
        Relationships: []
      }
      pengunjung: {
        Row: {
          alamat: string
          tgl_lahir: string
          username_p: string
        }
        Insert: {
          alamat: string
          tgl_lahir: string
          username_p: string
        }
        Update: {
          alamat?: string
          tgl_lahir?: string
          username_p?: string
        }
        Relationships: [
          {
            foreignKeyName: "pengunjung_username_p_fkey"
            columns: ["username_p"]
            isOneToOne: true
            referencedRelation: "pengguna"
            referencedColumns: ["username"]
          },
        ]
      }
      penjaga_hewan: {
        Row: {
          id_staf: string
          username_jh: string
        }
        Insert: {
          id_staf: string
          username_jh: string
        }
        Update: {
          id_staf?: string
          username_jh?: string
        }
        Relationships: [
          {
            foreignKeyName: "penjaga_hewan_username_jh_fkey"
            columns: ["username_jh"]
            isOneToOne: true
            referencedRelation: "pengguna"
            referencedColumns: ["username"]
          },
        ]
      }
      roles: {
        Row: {
          id: number
          permission_level: number
          permissions: Json
          role_name: string
        }
        Insert: {
          id?: never
          permission_level: number
          permissions: Json
          role_name: string
        }
        Update: {
          id?: never
          permission_level?: number
          permissions?: Json
          role_name?: string
        }
        Relationships: []
      }
      spesialisasi: {
        Row: {
          nama_spesialisasi: string
          username_sh: string
        }
        Insert: {
          nama_spesialisasi: string
          username_sh: string
        }
        Update: {
          nama_spesialisasi?: string
          username_sh?: string
        }
        Relationships: [
          {
            foreignKeyName: "spesialisasi_username_sh_fkey"
            columns: ["username_sh"]
            isOneToOne: false
            referencedRelation: "dokter_hewan"
            referencedColumns: ["username_dh"]
          },
        ]
      }
      staf_admin: {
        Row: {
          id_staf: string
          username_sa: string
        }
        Insert: {
          id_staf: string
          username_sa: string
        }
        Update: {
          id_staf?: string
          username_sa?: string
        }
        Relationships: [
          {
            foreignKeyName: "staf_admin_username_sa_fkey"
            columns: ["username_sa"]
            isOneToOne: true
            referencedRelation: "pengguna"
            referencedColumns: ["username"]
          },
        ]
      }
      wahana: {
        Row: {
          nama_wahana: string
          peraturan: string
        }
        Insert: {
          nama_wahana: string
          peraturan: string
        }
        Update: {
          nama_wahana?: string
          peraturan?: string
        }
        Relationships: [
          {
            foreignKeyName: "wahana_nama_wahana_fkey"
            columns: ["nama_wahana"]
            isOneToOne: true
            referencedRelation: "fasilitas"
            referencedColumns: ["nama"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  sizopi: {
    Enums: {},
  },
} as const
