'use client';

import { FaceIcon, PersonIcon } from '@radix-ui/react-icons';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { forwardRef, HTMLAttributes } from 'react';

interface IChatMessageProps extends HTMLAttributes<HTMLDivElement> {
  role: 'system' | 'user';
  content: string;
}

export const ChatMessage = forwardRef<HTMLDivElement, IChatMessageProps>(
  ({ role, content }: IChatMessageProps, ref) => {
    return (
      <div ref={ref} className={cn('flex flex-col')}>
        <div className={cn('mb-1 flex flex-row items-center gap-2')}>
          <div
            className={cn(
              'rounded-md border border-border/70 bg-primary p-2 text-primary-foreground',
              role === 'system' && 'border-border/40 bg-muted text-muted-foreground'
            )}
          >
            {role === 'system' ? <FaceIcon /> : <PersonIcon />}
          </div>
          <span className='text-sm font-bold'>{role === 'system' ? 'Model' : 'You'}</span>
        </div>
        {content === '<PENDING>' ? (
          <Skeleton className='ml-5 flex h-20 w-full rounded-md border-border/40' />
        ) : (
          <Card
            className={cn(
              'ml-5 flex w-full border-border/70 bg-primary text-primary-foreground',
              role === 'system' && 'border-border/40 bg-muted text-muted-foreground'
            )}
          >
            <CardContent className='flex flex-col gap-2 px-3 py-2'>
              <span className={cn('prose prose-neutral text-sm')}>{content}</span>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }
);
