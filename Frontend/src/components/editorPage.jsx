// EditorPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import { FaVideo, FaMicrophone, FaComments } from "react-icons/fa";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom"; // Optional routing
import MonacoEditor from "@monaco-editor/react"; // Monaco Editor

// Socket.io configuration
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  reconnectionAttempts: 3,
  timeout: 10000,
});

const EditorPage = () => {
  const [users, setUsers] = useState([]);
  const editorRef = useRef(null); // Ref to access the editor instance
  const navigate = useNavigate(); // For redirection

  // Function to emit code changes to the server
  const handleEditorChange = (value) => {
    socket.emit("code-change", value); // Send code to other users
  };

  // Setup socket events for user join, leave, and code changes
  useEffect(() => {
    socket.on("connect", () => console.log("Connected to server"));

    socket.on("user-joined", (user) => {
      setUsers((prev) => [...prev, user]);
      toast.success(`${user} has joined the room!`);
    });

    socket.on("user-left", (user) => {
      setUsers((prev) => prev.filter((u) => u !== user));
      toast.error(`${user} has left the room!`);
    });

    socket.on("code-change", (newCode) => {
      if (editorRef.current) {
        editorRef.current.setValue(newCode); // Update editor content
      }
    });

    socket.on("connect_error", () => toast.error("Connection failed!"));
    socket.on("disconnect", () => toast.error("Disconnected from server"));

    return () => {
      socket.emit("leave-room"); // Notify server when leaving
      socket.off(); // Cleanup listeners
    };
  }, []);

  const leaveRoom = () => {
    socket.emit("leave-room");
    toast("You left the room", { icon: "👋" });
    navigate("/"); // Redirect to the home page
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor; // Store the editor instance
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
                <li
                  key={index}
                  className="text-gray-800 text-sm py-2 px-4 bg-gray-200 rounded-lg my-2"
                >
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
          height="80vh"
          language="javascript"
          defaultValue="// Start coding..."
          onChange={handleEditorChange} // Capture code changes
          onMount={handleEditorDidMount} // Store editor instance
          theme="vs-dark" // Optional: use dark theme
        />
      </div>

      {/* Toast Notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
};

export default EditorPage;
