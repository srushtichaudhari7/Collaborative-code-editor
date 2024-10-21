import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FaVideo, FaMicrophone, FaComments } from "react-icons/fa";
import { io } from "socket.io-client";
import MonacoEditor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  reconnectionAttempts: 3,
  timeout: 10000,
});

const EditorPage = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]); // Store chat messages
  const [newMessage, setNewMessage] = useState(""); // Current message input
  const [code, setCode] = useState("// Start coding...");
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("connect", () => console.log("Connected to server"));

    socket.on("user-joined", (username) => {
      setUsers((prev) => [...prev, username]);
      toast.success(`${username} has joined the room!`);
    });

    socket.on("user-left", (username) => {
      setUsers((prev) => prev.filter((user) => user !== username));
      toast.error(`${username} has left the room!`);
    });

    socket.on("code-change", (newCode) => setCode(newCode));

    socket.on("receive-message", (message) => {
      setMessages((prev) => [...prev, message]); // Add new message to chat
    });

    return () => {
      socket.emit("leave-room");
      socket.off();
    };
  }, []);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = { user: "You", text: newMessage };
      setMessages((prev) => [...prev, message]); // Add to local messages
      socket.emit("send-message", message); // Send to backend
      setNewMessage(""); // Clear input field
    }
  };

  const leaveRoom = () => {
    socket.emit("leave-room");
    toast("You left the room", { icon: "👋" });
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-lg flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold p-4">Room Participants</h2>
          <ul className="p-4">
            {users.length === 0 ? (
              <p className="text-gray-500">No participants yet...</p>
            ) : (
              users.map((user, index) => (
                <li key={index} className="text-sm py-2 px-4 bg-gray-200 rounded-lg my-2">
                  {user}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="p-4 space-y-4">
          <button className="btn btn-primary w-full flex items-center justify-center space-x-2">
            <FaComments /> <span>Chat</span>
          </button>
          <button className="btn btn-success w-full flex items-center justify-center space-x-2">
            <FaVideo /> <span>Video Chat</span>
          </button>
          <button className="btn btn-accent w-full flex items-center justify-center space-x-2">
            <FaMicrophone /> <span>Voice Chat</span>
          </button>

          <button className="btn btn-error w-full" onClick={leaveRoom}>
            Leave Room
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="w-3/4 p-4">
        <h2 className="text-2xl font-semibold mb-4">Real-Time Code Editor</h2>
        <MonacoEditor
          height="70vh"
          language="javascript"
          theme="vs-dark"
          value={code}
          onChange={(newCode) => {
            setCode(newCode);
            socket.emit("code-change", newCode);
          }}
        />

        {/* Chat Box */}
        <div className="border-t mt-4">
          <h2 className="text-xl font-semibold">Chat</h2>
          <div className="chat-box h-40 overflow-y-scroll border p-2">
            {messages.map((msg, index) => (
              <div key={index} className="my-2">
                <strong>{msg.user}:</strong> {msg.text}
              </div>
            ))}
          </div>

          <div className="flex mt-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border rounded p-2"
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} className="btn btn-primary ml-2">
              Send
            </button>
          </div>
        </div>
      </div>

      <Toaster position="bottom-right" />
    </div>
  );
};

export default EditorPage;
