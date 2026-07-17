import {createContext, useEffect, useState} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase.js";
import runGemini from "../config/gemini";
import runGroq from "../config/groq";
import {addChatPrompt, loadChatHistory, saveChatHistory, saveChatToFirestore, loadChatsFromFirestore} from "../services/db";

export const Context = createContext();

const CHAT_CACHE_KEY = "hambir-chat-cache";

const loadChatCache = () => {
    try {
        const saved = localStorage.getItem(CHAT_CACHE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
};

const saveChatCache = (cache) => {
    try {
        localStorage.setItem(CHAT_CACHE_KEY, JSON.stringify(cache));
    } catch {}
};

const formatResponse = (text) => {
    const parts = text.split("**");
    let result = "";
    for (let i = 0; i < parts.length; i++) {
        if (i === 0 || i % 2 !== 1) {
            result += parts[i];
        } else {
            result += "<b>" + parts[i] + "</b>";
        }
    }
    return result.split("*").join("</br>");
};

const ContextProvider = (props) => {

    const [user, setUser] = useState(null);
    const [selectedModel, setSelectedModel] = useState("gemini");
    const [showSettings, setShowSettings] = useState(false);
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [prevPrompts, setPrevPrompts] = useState([]);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");
    const [chatCache, setChatCache] = useState({});

    useEffect(() => {
        const cached = loadChatCache();
        setChatCache(cached);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const { chats } = await loadChatsFromFirestore(currentUser.uid);
                const prompts = chats.map(c => c.prompt).filter(Boolean);
                setPrevPrompts(prompts.slice(0, 12));
                const history = {};
                chats.forEach(c => {
                    if (c.prompt) {
                        history[c.prompt] = {
                            rawResponse: c.response,
                            formattedResponse: formatResponse(c.response)
                        };
                    }
                });
                setChatCache(prev => ({ ...prev, ...history }));
            } else {
                setPrevPrompts(loadChatHistory());
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        saveChatHistory(prevPrompts);
    }, [prevPrompts]);

    useEffect(() => {
        saveChatCache(chatCache);
    }, [chatCache]);

    const delayPara = (index, nextWord) => {
        setTimeout(function () {
            setResultData(prev => prev + nextWord)
        }, 75 * index);
    }

    const newChat = () => {
        setLoading(false);
        setShowResult(false);
        setResultData("");
        setInput("");
    }

    const runModel = async (prompt) => {
        if (selectedModel === "groq") {
            return await runGroq(prompt);
        }
        return await runGemini(prompt);
    };

    const loadChat = (prompt) => {
        const cached = chatCache[prompt];
        if (cached) {
            setRecentPrompt(prompt);
            setResultData(cached.formattedResponse);
            setShowResult(true);
            setLoading(false);
        }
    };

    const onSent = async (prompt) => {

        setResultData("");
        setLoading(true);
        setShowResult(true);
        let response;
        const usedPrompt = prompt !== undefined ? prompt : input.trim();
        if (prompt !== undefined) {
            response = await runModel(prompt);
            setRecentPrompt(prompt);
            setPrevPrompts(prev => addChatPrompt(prev, prompt));
        } else {
            if (!usedPrompt) {
                setLoading(false);
                setShowResult(false);
                return;
            }
            setPrevPrompts(prev => addChatPrompt(prev, usedPrompt));
            setRecentPrompt(usedPrompt);
            response = await runModel(usedPrompt);
        }

        if (user) {
            saveChatToFirestore(user.uid, usedPrompt, response);
        }

        const formatted = formatResponse(response);
        setChatCache(prev => ({ ...prev, [usedPrompt]: { rawResponse: response, formattedResponse: formatted } }));

        let responseArray = formatted.split(" ");
        for (let i = 0; i < responseArray.length; i++) {
            const nextWord = responseArray[i];
            delayPara(i, nextWord + " ");
        }
        setLoading(false);
        setInput("");
    }

    const contextValue = {
        user,
        selectedModel,
        setSelectedModel,
        showSettings,
        setShowSettings,
        prevPrompts,
        setPrevPrompts,
        onSent,
        loadChat,
        recentPrompt,
        setRecentPrompt,
        showResult,
        loading,
        resultData,
        input,
        setInput,
        newChat
    }
    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    )
}

export default ContextProvider;