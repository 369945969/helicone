import { useState, useEffect } from "react";
import { ChatWindow } from "./chatWindow";

const FAMOUS_MOVIES = [
  {
    title: "黑暗骑士",
    leadCharacters: [
      "蝙蝠侠 / 布鲁斯·韦恩",
      "罗宾",
      "阿尔弗雷德",
      "小丑",
      "瑞秋",
      "哈维·登特",
    ],
  },
  {
    title: "暮光之城",
    leadCharacters: [
      "贝拉·斯旺",
      "爱德华·卡伦",
      "雅各布·布莱克",
      "罗里·沙利文",
    ],
  },
  {
    title: "加勒比海盗",
    leadCharacters: [
      "杰克·斯派洛",
      "威尔·特纳",
      "戴维·琼斯",
      "伊丽莎白·斯旺",
    ],
  },
];

export interface ChatHistory {
  role: "user" | "assistant";
  content: string;
}

const GuessWhoGame = () => {
  const [gameState, setGameState] = useState<"playing" | "finished">("playing");
  const [gameSessionId, setGameSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([
    {
      role: "assistant",
      content:
        "你好！我正在想一部著名电影中的角色。你能猜出是谁吗？向我询问关于角色或电影的问题来缩小范围！",
    },
  ]);
  const [selectedMovie, setSelectedMovie] = useState<
    (typeof FAMOUS_MOVIES)[number] | null
  >(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null,
  );

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const randomMovie =
      FAMOUS_MOVIES[Math.floor(Math.random() * FAMOUS_MOVIES.length)];
    const randomCharacter =
      randomMovie.leadCharacters[
        Math.floor(Math.random() * randomMovie.leadCharacters.length)
      ];
    setSelectedMovie(randomMovie);
    setSelectedCharacter(randomCharacter);
    setGameState("playing");
    setGameSessionId(crypto.randomUUID());
    setChatHistory([
      {
        role: "assistant",
        content:
          "你好！我正在想一部著名电影中的角色。你能猜出是谁吗？向我询问关于角色或电影的问题来缩小范围！",
      },
    ]);
  };

  const handleFinish = () => {
    setGameState("finished");
  };

  return (
    <div className="flex h-full w-full flex-col">
      {gameState === "playing" && selectedMovie && selectedCharacter && (
        <div className="h-full">
          <ChatWindow
            onFinish={handleFinish}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            movieTitle={selectedMovie.title}
            isLoading={false}
            movieCharacter={selectedCharacter}
            gameSessionId={gameSessionId}
          />
        </div>
      )}

      {gameState === "finished" && (
        <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
          <h1 className="text-2xl font-bold text-indigo-600">🎉 你赢了！🎉</h1>
          <p className="text-md">
            你在{" "}
            {chatHistory.length - 2 > 1 ? `${chatHistory.length - 2}` : "1"}{" "}
            {chatHistory.length - 2 > 1 ? "条消息" : "条消息"}内找到了角色！
          </p>
          <p className="text-sm">
            这个角色是{" "}
            <span className="font-semibold">{selectedCharacter}</span>，来自电影
            <span className="font-semibold">{selectedMovie?.title}</span>。
          </p>
          <button
            className="mt-4 rounded-md bg-indigo-500 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-600"
            onClick={startNewGame}
          >
            再玩一次
          </button>
        </div>
      )}
    </div>
  );
};

export default GuessWhoGame;
