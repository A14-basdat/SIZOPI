import { z } from 'zod';

export const satwaSchema = z.object({
  nama: z.string().nullable(),  // Changed from nama_individu to nama
  spesies: z.string().min(1, { message: "Spesies hewan wajib diisi" }),
  asal_hewan: z.string().min(1, { message: "Asal hewan wajib diisi" }),
  tanggal_lahir: z.date().nullable(),
  status_kesehatan: z.enum(['Sehat', 'Sakit', 'Dalam Pemantauan', 'Lainnya'], {
    required_error: "Status kesehatan wajib dipilih",
  }),
  nama_habitat: z.string().nullable(),
  url_foto: z.string().url({ message: "URL foto tidak valid" })
    .min(1, { message: "URL foto wajib diisi" }),
});

export const habitatSchema = z.object({
  nama: z.string().min(1, { message: "Nama habitat wajib diisi" }),
  luas_area: z.number().positive({ message: "Luas area harus lebih dari 0" }),
  kapasitas: z.number().int().positive({ message: "Kapasitas maksimal harus lebih dari 0" }),
  status: z.string().min(1, { message: "Status lingkungan wajib diisi" }),
});
