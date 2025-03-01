import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChatMessage,
  ChatMessageAuthor,
  ChatMessageServer,
} from '../../types/general';
import Message from './ConversationMessage';

type Props = {
  conversation: ChatMessage[];
  threadId: string;
  repoRef: string;
  repoName: string;
  isLoading?: boolean;
  isHistory?: boolean;
  onMessageEdit: (queryId: string, i: number) => void;
};

const Conversation = ({
  conversation,
  threadId,
  repoRef,
  isLoading,
  isHistory,
  repoName,
  onMessageEdit,
}: Props) => {
  const messagesRef = useRef<HTMLDivElement>(null);
  const [userScrolledUp, setUserScrolledUp] = useState(false);

  const handleScroll = useCallback(() => {
    if (messagesRef.current) {
      const scrollTop = messagesRef.current.scrollTop;
      const scrollHeight = messagesRef.current.scrollHeight;
      const clientHeight = messagesRef.current.clientHeight;

      setUserScrolledUp(scrollTop < scrollHeight - clientHeight);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (messagesRef.current) {
      messagesRef.current?.scrollTo({
        left: 0,
        top: messagesRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  useEffect(() => {
    if (!userScrolledUp) {
      scrollToBottom();
    }
  }, [conversation, scrollToBottom, userScrolledUp]);

  return (
    <div
      className={`w-full flex flex-col gap-3 pb-3 overflow-auto ${
        !isHistory ? 'max-h-60' : ''
      }`}
      ref={messagesRef}
      onScroll={handleScroll}
    >
      {conversation.map((m, i) => (
        <Message
          key={i}
          i={i}
          isLoading={m.author === ChatMessageAuthor.Server && m.isLoading}
          loadingSteps={
            m.author === ChatMessageAuthor.Server ? m.loadingSteps : []
          }
          results={
            m.author === ChatMessageAuthor.Server ? m.results : undefined
          }
          isHistory={isHistory}
          author={m.author}
          message={m.text}
          error={m.author === ChatMessageAuthor.Server ? m.error : ''}
          showInlineFeedback={
            m.author === ChatMessageAuthor.Server &&
            !m.isLoading &&
            !isLoading &&
            i === conversation.length - 1 &&
            !m.isFromHistory
          }
          threadId={threadId}
          queryId={
            m.author === ChatMessageAuthor.Server
              ? m.queryId
              : (conversation[i - 1] as ChatMessageServer)?.queryId ||
                '00000000-0000-0000-0000-000000000000'
          }
          repoRef={repoRef}
          scrollToBottom={scrollToBottom}
          repoName={repoName}
          onMessageEdit={onMessageEdit}
          responseTimestamp={
            m.author === ChatMessageAuthor.Server ? m.responseTimestamp : null
          }
          explainedFile={
            m.author === ChatMessageAuthor.Server ? m.explainedFile : undefined
          }
        />
      ))}
    </div>
  );
};

export default Conversation;
