"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { SendIcon, SparkleIcon } from "lucide-react";
import useThreads from "@/app/hooks/use-threads";
import { handleStreaming } from "@/lib/langchain";
import { useState } from "react";
import { MessageType } from "@/types";

const AskAI = ({ isCollapsed }: { isCollapsed: boolean }) => {
  const { accountId } = useThreads();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: Date.now(), content: input, role: "Human" },
    ]);

    try {
      const readableStream = await handleStreaming(input, accountId);

      const reader = readableStream.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let combinedContent = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunk = decoder.decode(value, { stream: true });
        combinedContent += chunk;
      }

      setMessages((prevMessages) => [
        ...prevMessages,
        { id: Date.now(), content: combinedContent, role: "Assistant" },
      ]);

      setInput('');
    } catch (error) {
      console.error("Error receiving stream:", error);
    } finally {
      setIsLoading(false);
    }

    setInput("");
  };

  // Return null if isCollapsed is true
  if (isCollapsed) return null;

  return (
    <div className="mb-14 p-4">
      <motion.div className="flex flex-1 flex-col items-end rounded-lg bg-gray-400 p-4 pb-4 shadow-inner dark:bg-gray-900">
        <div
          className="flex max-h-[50vh] w-full flex-col gap-2 overflow-y-scroll"
          id="message-container"
        >
          <AnimatePresence mode="wait">
            {messages.map((message, index) => {
              if (!message.content) {
                return (
                  <motion.div
                    key={`${message.id}-${index}`}
                    className="self-start rounded-2xl bg-gray-200 px-3 py-2 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                  >
                    Sorry, I couldn't find enough context to help. Could you
                    clarify your question or provide more details?
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={`${message.id}-${index}`}
                  layout="position"
                  className={cn('z-10 mt-2 max-w-[250px] break-words rounded-2xl', {
                    'self-end bg-blue-500 text-white': message.role === 'Human',
                    'self-start bg-green-500 text-white': message.role === 'Assistant',
                  })}
                  layoutId={`container-[${messages.length - 1}]`}
                  transition={{
                    type: "easeOut",
                    duration: 0.2,
                  }}
                >
                  <div className="px-3 py-2 text-[15px] leading-[15px]">
                    {message.content}
                  </div>
                </motion.div>
              );
            })}
            {isLoading && (
              <motion.div
                key="loading"
                layout="position"
                className="self-start bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-100 rounded-2xl px-3 py-2"
                layoutId="loading-indicator"
                transition={{
                  type: 'easeOut',
                  duration: 0.2,
                }}
              >
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-900 dark:border-gray-100 mr-2"></div>
                  <span>AI is processing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {messages.length > 0 && <div className="h-4" />}

        <div className="w-full">
          {messages.length === 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-4">
                <SparkleIcon className="size-6 text-gray-600" />
                <div>
                  <p className="text-gray-900 dark:text-gray-100">
                    Ask{" "}
                    <span className="text-md font-bold text-indigo-600">
                      Signify Genie
                    </span>{" "}
                    anything about your documents and emails
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-100">
                    Get AI answers on your documents and emails
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="flex w-full" onSubmit={handleSubmit}>
            <input
              className="relative h-9 flex-grow rounded-full border border-gray-200 bg-white px-3 py-1 text-[15px] outline-none placeholder:text-[13px]"
              placeholder="Ask Signify Genie..."
              value={input}
              onChange={handleInputChange}
            />
            <motion.div
              key={messages.length}
              className="pointer-events-none absolute z-10 flex h-9 w-[250px] items-center overflow-hidden break-words rounded-full bg-gray-200 [word-break:break-word] dark:bg-gray-800"
              layout="position"
              layoutId={`container-[${messages.length - 1}]`}
              transition={{
                type: "easeOut",
                duration: 0.2,
              }}
              initial={{ opacity: 0.6, zIndex: -1 }}
              animate={{ opacity: 0.6, zIndex: -1 }}
              exit={{ opacity: 1, zIndex: 1 }}
            >
              <div className="px-3 py-2 text-[15px] leading-[15px] text-gray-900 dark:text-gray-100">
                {input}
              </div>
            </motion.div>
            <button
              type="submit"
              className="ml-2 flex size-9 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800"
            >
              <SendIcon className="size-4 text-gray-500 dark:text-gray-300" />
            </button>
          </form>

          <div className="h-2" />

          {/* Moving default questions here: */}
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="cursor-pointer rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
              onClick={() => {
                handleInputChange({
                  target: { value: "What can I ask?" },
                } as unknown as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              What can I ask?
            </span>

            <span
              className="cursor-pointer rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
              onClick={() => {
                handleInputChange({
                  target: { value: "When is my next flight?" },
                } as unknown as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              When is my next flight?
            </span>

            <span
              className="cursor-pointer rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-200"
              onClick={() => {
                handleInputChange({
                  target: { value: "When is my next meeting?" },
                } as unknown as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              When is my next meeting?
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AskAI;