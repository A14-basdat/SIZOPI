import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordChangeFormProps {
  onSubmit: (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function PasswordChangeForm({ onSubmit, onCancel }: PasswordChangeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (formData.newPassword.length < 8) {
      setFormError("Password baru minimal 8 karakter");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setFormError("Konfirmasi password tidak cocok");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Terjadi kesalahan saat mengubah password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">UBAH PASSWORD</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {formError}
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="oldPassword">Password Lama:</Label>
          <Input
            id="oldPassword"
            name="oldPassword"
            type="password"
            value={formData.oldPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="newPassword">Password Baru:</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Konfirmasi Password Baru:</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex space-x-4 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "MENYIMPAN..." : "SIMPAN"}
          </Button>

          <Button type="button" variant="outline" onClick={onCancel}>
            BATAL
          </Button>
        </div>
      </form>
    </div>
  );
}