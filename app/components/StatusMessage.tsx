"use client";

interface StatusMessageType {
  message: string;
  type: "success" | "error" | "pending";
  id?: string;
}

interface Props {
  messages: StatusMessageType[];
  onUndo: (id?: string) => void;
}

export default function StatusMessage({ messages, onUndo }: Props) {
  if (messages.length === 0) return null;

  const styles = {
    success: {
      bg: "bg-gradient-to-r from-green-50 to-emerald-50",
      border: "border-green-300",
      text: "text-green-800",
      icon: "✅",
    },
    error: {
      bg: "bg-gradient-to-r from-red-50 to-rose-50",
      border: "border-red-300",
      text: "text-red-800",
      icon: "❌",
    },
    pending: {
      bg: "bg-gradient-to-r from-yellow-50 to-amber-50",
      border: "border-yellow-300",
      text: "text-yellow-800",
      icon: "⏳",
    },
  };

  return (
    <div className="mt-5 space-y-2">
      {messages.map((message, index) => {
        const style = styles[message.type];
        return (
          <div
            key={message.id || index}
            className={`p-4 rounded-lg border-2 font-medium ${style.bg} ${style.border} ${style.text} ${message.type === "pending" ? "flex justify-between items-center" : "text-center"}`}
          >
            <span className="flex items-center gap-2 text-sm">
              <span className="text-lg">{style.icon}</span>
              {message.message}
            </span>
            {message.type === "pending" && (
              <button
                onClick={() => onUndo(message.id)}
                className="ml-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium text-sm transition-all active:scale-95"
              >
                ↺ Undo
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
