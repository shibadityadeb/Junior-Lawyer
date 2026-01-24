

export interface MediaStackNewsItem {
  author: string | null;
  title: string;
  description: string;
  url: string;
  image: string | null;
  published_at: string;
  source: string;
}

export interface MediaStackResponse {
  data: MediaStackNewsItem[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
}

/**
 * Get actual news data from MediaStack API
 * Fetches 10 crime-related legal news articles from India
 */
export const getNewsFromMediaStack = async (): Promise<MediaStackResponse> => {
  const apiKey = process.env.NEWS_API_KEY;
  
  // Check if API key is provided
  if (!apiKey) {
    throw new Error('NEWS_API_KEY is not configured in .env file. Please add your MediaStack API key.');
  }

  try {
    // Constructing the URL with search parameters
    const baseUrl = 'https://api.mediastack.com/v1/news';
    const params = new URLSearchParams({
      access_key: apiKey,
      countries: 'in',
      keywords: 'law,legal',
      limit: '10'  // Fetch exactly 10 articles
    });

    console.log(`Fetching news from MediaStack API: ${baseUrl}`);
    const response = await fetch(`${baseUrl}?${params.toString()}`);

    // Check if the response is successful (status 200)
    if (!response.ok) {
      const errorData = await response.json() as any;
      throw new Error(`MediaStack API Error: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json() as MediaStackResponse;
    console.log(`Successfully fetched ${data.data.length} articles from MediaStack API`);
    return data;

  } catch (error) {
    console.error("Failed to fetch news from MediaStack:", error);
    throw error;
  }
};