import { Request, Response } from 'express';
import { getNewsFromMediaStack } from '../services/news.service';

/**
 * Get legal news about crimes in India
 * 
 * This endpoint returns news data shaped like MediaStack API response:
 * https://api.mediastack.com/v1/news
 * 
 * Future: This will fetch from MediaStack API with:
 * - countries: in
 * - keywords: crimes
 */
export const listNews = async (req: Request, res: Response): Promise<void> => {
  try {
    const newsData = await getNewsFromMediaStack();

    res.status(200).json({
      success: true,
      data: newsData.data,
      pagination: newsData.pagination,
      message: 'Legal news retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving legal news',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
