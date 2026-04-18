import { Textarea } from "@tremor/react";
import { useJawnClient } from "../../../../lib/clients/jawnHook";
import { Col, Row } from "../../../layout/common";
import { clsx } from "../../clsx";
import { ChatHistory } from "./ChatHistory";
import Typewriter from "./typewriter";
import { useState, useEffect, useRef } from "react";
import { hpf } from "@helicone/prompts";
import { useHeliconeAuthClient } from "@/packages/common/auth/client/AuthClientFactory";

export const ChatWindow = ({
  chatHistory,
  setChatHistory,
  onFinish,
  movieTitle,
  movieCharacter,
  gameSessionId,
}: {
  chatHistory: ChatHistory[];
  setChatHistory: (chatHistory: ChatHistory[]) => void;
  onFinish: () => void;
  movieTitle: string;
  movieCharacter: string;
  isLoading: boolean;
  gameSessionId: string | null;
}) => {
  const jawn = useJawnClient();

  const [sendingMessage, setSendingMessage] = useState(false);
  const [message, setMessage] = useState("");
  const { user } = useHeliconeAuthClient();

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, sendingMessage]);

  async function sendMessage(message: string) {
    if (sendingMessage) return;
    setSendingMessage(true);
    const chatHistoryCopy: ChatHistory[] = JSON.parse(
      JSON.stringify(chatHistory),
    );
    setMessage("");

    const correctGuessCheckerPromise = jawn.POST("/v1/demo/completion", {
      body: {
        promptId: "Movie-Character-Guesser-Chat-Checker",
        userEmail: user?.email ?? "no-email",
        sessionId: gameSessionId ?? "",
        sessionName: "Movie Character Guesser",
        messages: [
          {
            role: "system",
            content: `
你是一位有用的助手，检查用户是否正确猜出了角色。你可以接受接近或拼写略有不同的答案。

只有当用户正确猜出角色时才返回 true。否则返回 false。

示例：
助手："角色：瑞秋·雷"
用户消息："我认为是约翰·特拉沃尔塔"
回复："false"

助手："角色：瑞秋·雷"
用户消息："你是瑞秋吗？"
回复："true"
            `,
          },
          {
            role: "user",
            content: hpf`Character: ${{ movieCharacter }}`,
          },
          {
            role: "user",
            content: hpf`User Message: ${{ message }}`,
          },
        ],
      },
    });

    const responsePromise = jawn.POST("/v1/demo/completion", {
      body: {
        promptId: "Movie-Character-Guesser-Chat",
        userEmail: user?.email ?? "no-email",
        sessionId: gameSessionId ?? "",
        sessionName: "Movie Character Guesser",
        messages: [
          {
            role: "system",
            content: hpf`你是电影 ${{ movieTitle }} 中的 ${{ movieCharacter }}。像 ${{ movieCharacter }} 一样回答问题。

不要透露你的身份。用户正在尝试猜测这个角色。
            `,
          },
          ...chatHistory,
          {
            role: "user",
            content: message,
          },
        ],
      },
    });
    setChatHistory([...chatHistoryCopy, { role: "user", content: message }]);

    const correctGuessChecker = await correctGuessCheckerPromise;

    if (correctGuessChecker.data?.data?.choices[0].message.content === "true") {
      onFinish();
    } else {
      const response = await responsePromise;

      const responseContent = response.data?.data?.choices[0].message.content;
      setChatHistory([
        ...chatHistoryCopy,
        { role: "user", content: message },
        { role: "assistant", content: responseContent || "" },
      ]);
    }
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setSendingMessage(false);
  }

  return (
    <Col className="flex h-full w-full flex-col">
      <Col className="flex-shrink-0 p-4">
        <p className="animate-popin text-center text-2xl tracking-[10px]">
          你的电影是
        </p>
        <div className="flex justify-center tracking-[5px]">
          <Typewriter
            text={movieTitle}
            speed={50}
            delay={1000}
            onComplete={() => {}}
          />
        </div>
      </Col>
      <Col className="flex-grow overflow-hidden rounded-xl bg-white bg-opacity-20">
        <Col className="flex h-full flex-col">
          <Col className="flex-grow space-y-4 overflow-y-auto p-4 text-white">
            {chatHistory.map((chat, index) => (
              <Row
                key={index}
                className={clsx(
                  "w-full",
                  chat.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <Col
                  className={clsx(
                    "max-w-[80%] rounded-lg p-2 px-3 shadow-sm",
                    chat.role === "user" ? "bg-blue-500" : "bg-blue-400",
                  )}
                >
                  {chat.role === "user" ? (
                    <div>{chat.content}</div>
                  ) : (
                    <Typewriter
                      text={chat.content}
                      speed={5}
                      delay={0}
                      onComplete={() =>
                        chatEndRef.current?.scrollIntoView({
                          behavior: "smooth",
                        })
                      }
                    />
                  )}
                </Col>
              </Row>
            ))}
            {sendingMessage && (
              <Row className={clsx("w-full", "animate-pulse justify-start")}>
                <Col
                  className={clsx(
                    "max-w-[80%] rounded-lg p-2 px-3 shadow-sm",
                    "bg-blue-400",
                  )}
                >
                  ...
                </Col>
              </Row>
            )}
            <div ref={chatEndRef} />
          </Col>
          <Col className="flex-shrink-0 bg-white bg-opacity-10 p-4">
            <Row className={clsx("w-full", sendingMessage && "opacity-50")}>
              <Textarea
                disabled={sendingMessage}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(message);
                  }
                }}
                className="flex-grow"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={() => sendMessage(message)}
                className="ml-2 flex items-center justify-center p-2 text-2xl"
              >
                🚀
              </button>
            </Row>
            <div className="mt-2 text-center text-sm italic text-opacity-45">
              提出问题来尝试猜测电影中的角色。
            </div>
          </Col>
        </Col>
      </Col>
    </Col>
  );
};
