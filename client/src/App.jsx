import { useState, useEffect, useRef } from "react";
import axios from "axios";

const App = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const sessionIdRef = useRef(
    Date.now().toString(36) + Math.random().toString(36).substring(2),
  );

  // Auto-scroll to bottom whenever messages change or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async () => {
    const currentInput = input.trim();
    if (!currentInput) return;

    setLoading(true);
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: currentInput }]);

    try {
      const response = await axios.post("http://localhost:3001/api/chat", {
        prompt: currentInput,
        sessionId: sessionIdRef.current,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: response.data.response },
      ]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Something went wrong. Please try again.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <main className="container mx-auto max-w-4xl py-10 px-4">
      {/* Messages */}
      <div className="pb-56 space-y-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-2xl w-fit max-w-[80%] ${
              message.role === "user"
                ? "bg-neutral-700 ml-auto"
                : message.isError
                  ? "bg-red-800 mr-auto"
                  : " mr-auto"
            }`}
          >
            <p className="text-sm text-white whitespace-pre-wrap">
              {message.text}
            </p>
          </div>
        ))}

        {loading && (
          <div className=" mr-auto">
            <p className="text-sm text-white animate-pulse">thinking...</p>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={bottomRef} />
      </div>

      {/* Input box */}
      <div className="fixed bottom-0 inset-x-0 bg-neutral-900">
        <div className="max-w-3xl mx-auto pt-4 pb-10">
          <div className="w-full p-3 rounded-2xl bg-neutral-700 text-white space-y-4">
            <textarea
              className="text-sm focus:outline-none w-full resize-none p-2 bg-transparent"
              placeholder="Type your message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
            />
            <div className="flex justify-end items-center">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gray-50 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-4 py-2 rounded-xl text-sm cursor-pointer transition-colors duration-300"
              >
                {loading ? "Asking..." : "Ask"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
