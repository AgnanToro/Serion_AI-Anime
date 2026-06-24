import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { profileService, type Profile, type UserSettings } from "@/services/profileService";
import { useTheme } from "@/lib/theme-provider";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    profileService.get(user.id).then(setProfile);
    profileService.getSettings(user.id).then(setSettings);
  }, [user]);

  async function save() {
    if (!user || !profile) return;
    setSaving(true);
    try {
      await profileService.update(user.id, {
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
      });
      if (settings) await profileService.updateSettings(user.id, settings);
      toast.success("Settings saved");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Save failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const url = await profileService.uploadAvatar(user.id, file);
      setProfile((p) => (p ? { ...p, avatar_url: url } : p));
      await profileService.update(user.id, { avatar_url: url });
      toast.success("Avatar updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (!profile || !settings) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <section className="glass rounded-3xl p-6 space-y-4">
        <h2 className="font-semibold">Profile</h2>
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              className="h-16 w-16 rounded-2xl object-cover ring-1 ring-border"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-brand grid place-items-center text-background font-bold text-xl">
              {(profile.display_name ?? profile.username ?? "S").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <Label className="mb-2 block">Avatar</Label>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickFile} />
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading…" : "Upload image"}
            </Button>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Username</Label>
            <Input
              value={profile.username ?? ""}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Display name</Label>
            <Input
              value={profile.display_name ?? ""}
              onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input disabled value={user?.email ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label>Bio</Label>
          <Textarea
            value={profile.bio ?? ""}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
          />
        </div>
      </section>

      <section className="glass rounded-3xl p-6 space-y-4">
        <h2 className="font-semibold">Appearance</h2>
        <div className="flex gap-2">
          {(["dark", "light"] as const).map((t) => (
            <Button
              key={t}
              variant={theme === t ? "default" : "outline"}
              className="rounded-full capitalize"
              onClick={() => setTheme(t)}
            >
              {t}
            </Button>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          onClick={save}
          disabled={saving}
          className="rounded-full bg-brand text-background border-0 hover:bg-brand/90"
        >
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
