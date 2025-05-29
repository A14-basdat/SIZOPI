import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProfileCardProps {
  name?: string;
  email?: string;
  role?: string;
  joinedDate?: string;
  bio?: string;
  skills?: string[];
  imageUrl?: string;
}

export function ProfileCard({
  name = "John Doe",
  email = "john.doe@example.com",
  role = "Software Developer",
  joinedDate = "April 2023",
  bio = "Enthusiastic software developer with expertise in React and Next.js. Passionate about building user-friendly web applications and exploring new technologies.",
  skills = ["React", "Next.js", "TypeScript", "Tailwind CSS", "Supabase"],
  imageUrl = "/profile-placeholder.png",
}: ProfileCardProps) {
  return (
    <div className="bg-card rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 relative">
        <div className="absolute -bottom-16 left-8">
          <div className="rounded-full border-4 border-background overflow-hidden h-32 w-32 bg-slate-200">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={name}
                width={128}
                height={128}
                className="object-cover"
                priority
              />
            )}
          </div>
        </div>
      </div>

      <div className="pt-20 pb-8 px-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-muted-foreground">{email}</p>
            <div className="flex items-center mt-1 gap-2">
              <Badge variant="outline">{role}</Badge>
              <span className="text-xs text-muted-foreground">Joined {joinedDate}</span>
            </div>
          </div>
          <Button variant="outline" size="sm">Edit Profile</Button>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-muted-foreground">{bio}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary">{skill}</Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}