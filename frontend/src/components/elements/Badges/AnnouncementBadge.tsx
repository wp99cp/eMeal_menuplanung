import { TextLink } from '@/components/elements/TextLink';

interface AnnouncementBadgeProps {
  caption: string;
  linkText: string;
  href: string;
}

export const AnnouncementBadge = ({
  caption,
  linkText,
  href,
}: AnnouncementBadgeProps) => {
  return (
    <div className="relative overflow-hidden rounded-full py-1.5 px-4 text-sm leading-6 ring-1 ring-gray-900/10 hover:ring-gray-900/20">
      <span className="text-gray-600">
        {caption}{' '}
        <TextLink href="/about">
          <span className="absolute inset-0" aria-hidden="true" />
          {linkText}
        </TextLink>
      </span>
    </div>
  );
};
