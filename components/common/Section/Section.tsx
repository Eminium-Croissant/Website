import { ReactNode } from 'react';

type SectionProps = {
  title: string;
  children: ReactNode;
};

export default function Section({ title, children }) {
  return (
    <div className='space-y-4'>
      <h3 className='text-xl font-semibold text-[#e2e8f0] mb-2'>{title}</h3>
      <div className='text-[#bdbdbd]'>{children}</div>
    </div>
  );
}
