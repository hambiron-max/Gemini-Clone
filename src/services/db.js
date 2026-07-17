import { collection, addDoc, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../config/firebase.js";

const STORAGE_KEY = "hambir-chat-history";

export const loadChatHistory = () => {
    if (typeof window === "undefined") {
        return [];
    }

    try {
        const savedHistory = window.localStorage.getItem(STORAGE_KEY);
        return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
        console.error("Failed to load chat history", error);
        return [];
    }
};

export const saveChatHistory = (history) => {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
        console.error("Failed to save chat history", error);
    }
};

export const addChatPrompt = (history, prompt) => {
    const cleanedPrompt = prompt?.trim();
    if (!cleanedPrompt) {
        return history;
    }

    const filteredHistory = history.filter((item) => item !== cleanedPrompt);
    const nextHistory = [cleanedPrompt, ...filteredHistory].slice(0, 12);

    return nextHistory;
};

export const saveChatToFirestore = async (userId, prompt, response) => {
    try {
        const chatsRef = collection(db, "users", userId, "chats");
        await addDoc(chatsRef, {
            prompt,
            response,
            createdAt: new Date(),
        });
    } catch (error) {
        console.error("Failed to save chat to Firestore", error);
    }
};

export const loadChatsFromFirestore = async (userId) => {
    try {
        const chatsRef = collection(db, "users", userId, "chats");
        const q = query(chatsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const chats = [];
        const prompts = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            chats.push({ id: doc.id, ...data });
            prompts.push(data.prompt);
        });
        return { chats, prompts };
    } catch (error) {
        console.error("Failed to load chats from Firestore", error);
        return { chats: [], prompts: [] };
    }
};
