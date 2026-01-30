import { X } from 'lucide-react';

export function AnnouncementBanner() {
  // Banner is always visible, so we don't need state to control visibility
  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-[rgb(178,160,124)] text-[rgb(60,40,30)] py-2 px-4 text-center text-sm">
      <div className="container mx-auto flex items-center justify-center">
        <a
          href="https://otherdev.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium flex items-center underline hover:no-underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          AdinaHouseHold X OtherDev
        </a>
      </div>
    </div>
  );
}