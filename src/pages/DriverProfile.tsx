import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { User, Phone, Mail, Settings, LogOut } from "lucide-react";

const DriverProfile = () => {
  const { user, profile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState<string>(profile?.ime || "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>((user as any)?.user_metadata?.avatar_url || null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setName(profile?.ime || "");
    setAvatarUrl((user as any)?.user_metadata?.avatar_url || null);
  }, [profile?.ime, user]);

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file || !user) return;
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
      toast.success("Сликата е поставена.");
    } catch (err: any) {
      toast.error(err.message || "Неуспешно поставување на слика (проверете дали постои bucket 'avatars').");
    } finally {
      setUploading(false);
    }
  };

  const onSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updates: any = {};
      if (name && name !== profile?.ime) updates.ime = name;
      if (Object.keys(updates).length > 0) {
        const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
        if (error) throw error;
      }
      await supabase.auth.updateUser({ data: { ime: name, avatar_url: avatarUrl || null } });
      toast.success("Профилот е ажуриран.");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Неуспешно ажурирање на профил.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SEO
        title="Профил — Гранд Партнер АС"
        description="Профил и поставки за возач."
        canonical="https://07df5133-d711-4d7b-9d29-cf9c152e0817.lovableproject.com/vozac/profile"
      />
      
      <PageHeader 
        title="Мојот профил" 
        subtitle="Лични податоци и поставки"
        customBackPath="/vozac"
      />

      <main className="mobile-container mobile-content">
        {/* Profile Card */}
        <div className="mobile-card mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              <Avatar className="w-16 h-16">
                <AvatarImage src={avatarUrl || undefined} alt="avatar" />
                <AvatarFallback>
                  <User className="w-8 h-8 text-primary" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Име и презиме" />
                  <div className="flex items-center gap-2">
                    <input type="file" accept="image/*" onChange={onAvatarChange} />
                    {uploading && <span className="text-xs text-muted-foreground">Се качува...</span>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={onSave} disabled={saving}>
                      {saving ? "Се зачувува..." : "Зачувај"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      Откажи
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-foreground">
                    {name || profile?.ime || user?.email?.split('@')[0] || 'Возач'}
                  </h2>
                  <p className="text-sm text-muted-foreground">Активен возач</p>
                </>
              )}
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Измени
              </Button>
            )}
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user?.email || 'Не е поставен'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{profile?.telefon || 'Не е поставен'}</span>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="mobile-card mb-6">
          <h3 className="text-lg font-semibold mb-4">Поставки</h3>
          <div className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-3" />
              Нотификации
            </Button>
            {/* Edit profile removed per requirements. Editing will be limited to name and avatar in the top section when implemented. */}
          </div>
        </div>

        {/* Logout */}
        <div className="mobile-card">
          <Button 
            variant="outline" 
            className="w-full text-red-600 border-red-200 hover:bg-red-50"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Одјава
          </Button>
        </div>

        {/* Development Note */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Детални поставки и уредување на профил ќе бидат достапни наскоро.
          </p>
        </div>
      </main>
    </>
  );
};

export default DriverProfile;
