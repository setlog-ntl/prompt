"use client";

import { useState, useEffect } from "react";

type SelectedScope = "project" | "agent";
type OutputMode = "prompt" | "prompt+md";

export default function Home() {
  const [selectedScope, setSelectedScope] = useState<SelectedScope>("project");
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [availableAgents, setAvailableAgents] = useState<string[]>([]);
  const [userInput, setUserInput] = useState("");
  const [outputMode, setOutputMode] = useState<OutputMode>("prompt");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [generatedDoc, setGeneratedDoc] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 에이전트 목록 로드
  useEffect(() => {
    fetch("/api/agents")
      .then((res) => res.json())
      .then((data) => {
        if (data.agents) {
          setAvailableAgents(data.agents);
          if (data.agents.length > 0 && selectedAgents.length === 0) {
            setSelectedAgents([data.agents[0]]);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load agents:", err);
        setError("에이전트 목록을 불러오는데 실패했습니다.");
      });
  }, []);

  const handleGenerate = async () => {
    if (!userInput.trim()) {
      setError("자유 입력을 작성해주세요.");
      return;
    }
    if (selectedScope === "agent" && selectedAgents.length === 0) {
      setError("Sub-Agent를 최소 1개 선택해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedPrompt("");
    setGeneratedDoc(undefined);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selectedScope,
          selectedAgents: selectedScope === "agent" ? selectedAgents : [],
          userInput,
          outputMode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "프롬프트 생성에 실패했습니다.");
      }

      setGeneratedPrompt(data.generatedPrompt || "");
      setGeneratedDoc(data.generatedDoc);
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      alert("프롬프트가 클립보드에 복사되었습니다!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            VibePrompt OS Web
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            자유 입력을 실행용 프롬프트로 변환하는 1인용 도구
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 입력 섹션 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-zinc-900 dark:text-zinc-50">
                설정
              </h2>

              {/* Scope 선택 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                  변경 단위 선택
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="scope"
                      value="project"
                      checked={selectedScope === "project"}
                      onChange={(e) => {
                        setSelectedScope("project");
                        setSelectedAgents([]);
                      }}
                      className="mr-2"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Project
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="scope"
                      value="agent"
                      checked={selectedScope === "agent"}
                      onChange={(e) => {
                        setSelectedScope("agent");
                        if (selectedAgents.length === 0 && availableAgents.length > 0) {
                          setSelectedAgents([availableAgents[0]]);
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      Sub-Agent
                    </span>
                  </label>
                </div>
              </div>

              {/* Sub-Agent 선택 */}
              {selectedScope === "agent" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                    Sub-Agent 선택 (복수 선택 가능)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border border-zinc-200 dark:border-zinc-700 rounded p-3">
                    {availableAgents.length === 0 ? (
                      <p className="text-sm text-zinc-500">
                        에이전트를 불러오는 중...
                      </p>
                    ) : (
                      availableAgents.map((agent) => (
                        <label
                          key={agent}
                          className="flex items-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAgents.includes(agent)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAgents([...selectedAgents, agent]);
                              } else {
                                setSelectedAgents(
                                  selectedAgents.filter((a) => a !== agent)
                                );
                              }
                            }}
                            className="mr-2"
                          />
                          <span className="text-zinc-700 dark:text-zinc-300">
                            {agent}
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Output Mode 선택 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                  출력 옵션
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="outputMode"
                      value="prompt"
                      checked={outputMode === "prompt"}
                      onChange={(e) => setOutputMode("prompt")}
                      className="mr-2"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      실행 프롬프트
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="outputMode"
                      value="prompt+md"
                      checked={outputMode === "prompt+md"}
                      onChange={(e) => setOutputMode("prompt+md")}
                      className="mr-2"
                    />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      프롬프트 + 문서
                    </span>
                  </label>
                </div>
              </div>

              {/* 자유 입력 */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                  자유 입력
                </label>
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="변경 요청사항을 자유롭게 입력하세요..."
                  className="w-full h-48 p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Generate 버튼 */}
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                {isLoading ? "생성 중..." : "프롬프트 생성"}
              </button>

              {/* 에러 메시지 */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* 출력 섹션 */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  생성된 프롬프트
                </h2>
                {generatedPrompt && (
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 text-zinc-900 dark:text-zinc-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    복사
                  </button>
                )}
              </div>

              {generatedPrompt ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                      실행용 프롬프트
                    </label>
                    <pre className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-50 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto font-mono">
                      {generatedPrompt}
                    </pre>
                  </div>

                  {generatedDoc && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                        문서형 출력
                      </label>
                      <pre className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-zinc-50 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto font-mono">
                        {generatedDoc}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                  프롬프트를 생성하면 여기에 표시됩니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
