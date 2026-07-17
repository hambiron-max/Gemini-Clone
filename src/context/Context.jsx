import {createContext, useEffect, useState} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase.js";
import runGemini from "../config/gemini";
import runGroq from "../config/groq";
import {addChatPrompt, loadChatHistory, saveChatHistory, saveChatToFirestore, loadChatsFromFirestore} from "../services/db";

export const Context = createContext();

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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                const { prompts } = await loadChatsFromFirestore(currentUser.uid);
                setPrevPrompts(prompts.slice(0, 12));
            } else {
                setPrevPrompts(loadChatHistory());
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        saveChatHistory(prevPrompts);
    }, [prevPrompts]);

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

        let responseArray = response.split("**");
        let newResponse = "";
        for (let i = 0; i < responseArray.length; i++) {
            if (i === 0 || i % 2 !== 1) {
                newResponse += responseArray[i];
            } else {
                newResponse += "<b>" + responseArray[i] + "</b>"
            }

        }
        let newResponse2 = newResponse.split("*").join("</br>");
        let newResponseArray = newResponse2.split(" ");
        for (let i = 0; i < newResponseArray.length; i++) {
            const nextWord = newResponseArray[i];
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