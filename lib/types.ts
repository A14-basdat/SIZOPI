export interface Satwa {
  id: string;
  nama: string | null;  // Changed from nama_individu to nama to match database schema
  spesies: string;
  asal_hewan: string;
  tanggal_lahir: Date | null;
  status_kesehatan: 'Sehat' | 'Sakit' | 'Dalam Pemantauan' | 'Lainnya';
  nama_habitat: string | null;
  url_foto: string;
}

export interface Habitat {
  nama: string;
  luas_area: number;
  kapasitas: number;
  status: string;
}

export type SatwaFormData = Omit<Satwa, 'id'>;
export type HabitatFormData = Habitat;
