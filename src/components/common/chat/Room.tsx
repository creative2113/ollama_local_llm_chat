'use client';
import { useQuery } from '@tanstack/react-query';
import { useContext, useEffect, useRef } from 'react';

import type {
  IAPIChatMessagesGetOutput,
  IAPIChatMessagesGetParams,
} from '@/app/api/chat/messages/get/types';
import type { IAPIDocumentsGetResults } from '@/app/api/documents/get/types';

import { useToast } from '@/components/ui/use-toast';

import { roomIDContext } from '@/lib/contexts/chatRoomIdContext';
import { chatRoomMessagesContext } from '@/lib/contexts/chatRoomMessagesContext';

import { ChatMessage } from './ChatMessage';

const Room = () => {
  const { roomId } = useContext(roomIDContext);
  const { documents, setDocuments, messages, setMessages, streamed, setInvokeParams } =
    useContext(chatRoomMessagesContext);
  const { toast } = useToast();

  const streamedRef = useRef<HTMLDivElement>(null);

  const handleReInvoke = (systemMessageId: string) => {
    if (!messages || messages.length === 0) {
      return;
    }
    let index = -1;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].persona === 'user') {
        index = i;
        break;
      }
    }
    if (index < 0) {
      return;
    }

    const lastUserMessage = messages[index];
    const previousMessages = index > 0 ? messages.slice(0, index) : [];
    if (setInvokeParams) {
      setInvokeParams({
        message: lastUserMessage.content as string,
        // TODO: Add flag for when user discards history
        previousMessages,
        //TODO:CHANGETOROOMHOOK
        hasDocuments: documents !== undefined && documents.length > 0,
        systemMessageId,
      });
    }
  };

  const {
    data: initialMessages,
    isFetching,
    error,
  } = useQuery<IAPIChatMessagesGetOutput, Error>({
    queryKey: ['chat', 'messages', 'get', roomId],
    queryFn: async ({ signal }) => {
      const payload: IAPIChatMessagesGetParams = {
        roomId,
      };
      return fetch('/api/chat/messages/get', {
        signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).then((res) => res.json());
    },
    enabled: roomId !== undefined && roomId.length > 0,
  });

  const { data: roomDocuments } = useQuery<IAPIDocumentsGetResults>({
    queryKey: ['chat', 'documents', 'get', roomId],
    queryFn: async ({ signal }) => {
      const payload = { roomId };
      return await fetch('/api/documents/get', {
        signal,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).then((res) => res.json());
    },
  });

  useEffect(() => {
    if (setDocuments && roomDocuments !== undefined && Array.isArray(roomDocuments.documents)) {
      setDocuments(roomDocuments.documents);
    }
  }, [setDocuments, roomDocuments]);

  useEffect(() => {
    if (setMessages !== undefined && initialMessages && initialMessages.messages !== undefined) {
      setMessages([...initialMessages.messages]);
    }
  }, [setMessages, initialMessages]);

  useEffect(() => {
    if (error !== null) {
      toast({
        variant: 'destructive',
        duration: 2000,
        title:
          'Oh no! An error occurred while fetching the messages for this room. ' +
          'Please refresh the page, or try again later.',
        description: error.message,
      });
    }
  }, [error]);

  useEffect(() => {
    if (streamed && streamedRef.current) {
      streamedRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamed, streamedRef]);

  return messages !== undefined && messages.length > 0 ? (
    <>
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          role={message.persona ? (message.persona as 'system' | 'user') : 'user'}
          content={message.content ?? 'EMPTY'}
          isLast={index === messages.length - 1}
          isAborted={message.isAborted ?? false}
          reInvoke={() => handleReInvoke(message.id as string)}
        />
      ))}
      {streamed.length > 0 && (
        <>
          <ChatMessage role='system' content={streamed} isStreaming isLast />
          <div className='h-0 w-0' messageId='chat-scroll-ref' ref={streamedRef} />
        </>
      )}
    </>
  ) : messages !== undefined && messages.length === 0 ? (
    <>
      <span>No messages here. Send some!</span>
    </>
  ) : (
    messages === undefined &&
    isFetching && (
      <>
        <span>Loading...</span>
      </>
    )
  );
};

export default Room;