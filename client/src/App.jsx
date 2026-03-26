import { useState } from "react";

const App = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSubmit = () => {
    const trimmedInput = input.trim();

    if (!trimmedInput) {
      return;
    }

    setMessages((prev) => [...prev, { role: "user", text: trimmedInput }]);
    setInput("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <main className="container mx-auto max-w-4xl py-10 px-4">
      {/* messages */}
      <div className="pb-56">
        {/* user message */}
        <div className="space-y-2">
          {messages
            .filter((message) => message.role === "user")
            .map((message, index) => (
              <div
                key={index}
                className="bg-neutral-700 p-3 rounded-2xl ml-auto w-fit max-w-[80%]"
              >
                <h1>{message.text}</h1>
              </div>
            ))}
        </div>

        {/* AI message */}
        {/* <div className="space-y-2 mt-4">
          <h1>Hi from AI</h1>
        </div> */}
      </div>

      {/* search box */}
      <div className="fixed bottom-0 inset-x-0 bg-neutral-900">
        <div className="max-w-3xl mx-auto pt-4 pb-10">
          <div className="w-full p-3 rounded-2xl bg-neutral-700 text-white space-y-4">
            {/* input field */}
            <textarea
              className="text-sm focus:outline-none w-full resize-none p-2"
              placeholder="Type your message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
            />

            {/* tool and ask button */}
            <div className="flex justify-end items-center">
              {/* ask button */}
              <button
                onClick={handleSubmit}
                className="bg-gray-50 hover:bg-gray-300 text-black font-semibold px-4 py-2 rounded-xl text-sm cursor-pointer transition-colors duration-300"
              >
                Ask
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;
