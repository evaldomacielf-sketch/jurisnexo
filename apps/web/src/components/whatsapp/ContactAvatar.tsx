'use client';

interface ContactAvatarProps {
  name: string;
  status?: 'online' | 'offline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  image?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-20 h-20 text-xl',
};

export function ContactAvatar({ name, status, size = 'md', image }: ContactAvatarProps) {
  const initials = name.charAt(0).toUpperCase();

  return (
    <div className="relative shrink-0">
      <div
        className={`${sizeClasses[size]} flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] font-bold text-white shadow-sm`}
      >
        {image ? <img src={image} alt={name} className="h-full w-full object-cover" /> : initials}
      </div>
      {status && (
        <div
          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white dark:border-gray-900 ${
            status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          }`}
        />
      )}
    </div>
  );
}
