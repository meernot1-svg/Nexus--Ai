import axios from "axios";
import { Message } from "../types";

export const chatWithJarvis = async (messages: Message[], systemPrompt?: string) => {
  const response = await axios.post("/api/chat", { messages, systemPrompt });
  return response.data;
};

export const searchWithSerper = async (query: string) => {
  const response = await axios.post("/api/search", { query });
  return response.data;
};

export const searchYouTubeProxy = async (query: string) => {
  const response = await axios.post("/api/youtube", { query });
  return response.data;
};

export const convertTextToSpeech = async (text: string, voiceId?: string) => {
  const response = await axios.post("/api/voice", { text, voiceId }, { responseType: "blob" });
  return response.data;
};
