import { createContext, useContext, useState, useEffect } from "react";

const PromptBotContext = createContext();

const INITIAL_MSG = {
  role: 'bot',
  content:
    "Hi! I'm Artzy Bot 🤖🎨\n\nTell me your idea in any language — even a rough one! I'll ask a few questions if needed, then craft you a perfect AI art prompt.\n\n*Try: \"a dragon in a forest\" or \"something futuristic and colorful\"*",
  hasPrompt: false,
  prompt: null,
  id: 'init',
};

export const PromptBotProvider = ({ children }) => {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem("artzyBotChat");

    return saved
      ? JSON.parse(saved)
      : [INITIAL_MSG];
  });

  useEffect(() => {
    localStorage.setItem(
      "artzyBotChat",
      JSON.stringify(messages)
    );
  }, [messages]);

  const clearChat = () => {
    localStorage.removeItem("artzyBotChat");
    setMessages([INITIAL_MSG]);
  };

  return (
    <PromptBotContext.Provider
      value={{
        messages,
        setMessages,
        clearChat,
      }}
    >
      {children}
    </PromptBotContext.Provider>
  );
};

export const usePromptBot = () =>
  useContext(PromptBotContext);