import { searchYouTubeProxy } from './api';

export interface YouTubeVideo {
  title: string;
  link: string;
  snippet: string;
  thumbnail: string;
  duration?: string;
  views?: string;
  channel?: string;
}

export const searchYouTube = async (query: string): Promise<YouTubeVideo[]> => {
  try {
    const data = await searchYouTubeProxy(query);

    return data.videos.slice(0, 5).map((v: any) => ({
      title: v.title,
      link: v.link,
      snippet: v.snippet,
      thumbnail: v.imageUrl || v.thumbnail,
      duration: v.duration,
      views: v.views,
      channel: v.channel
    }));
  } catch (error) {
    console.error('YouTube Search Failed:', error);
    return [];
  }
};

export const getEmbedUrl = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};
