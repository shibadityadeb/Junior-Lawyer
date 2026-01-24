import { Request, Response } from 'express';

export const listSchemes = async (req: Request, res: Response): Promise<void> => {
  try {
    const schemes = [
      {
        id: 1,
        name: 'Government Legal Aid Scheme',
        description: 'Provides free legal aid to economically weaker sections',
        type: 'Government',
      },
      {
        id: 2,
        name: 'National Legal Services Authority (NLSA)',
        description: 'Provides free legal services and aid to marginalized sections',
        type: 'Government',
      },
      {
        id: 3,
        name: 'State Legal Services Scheme',
        description: 'State-level legal aid scheme for citizens',
        type: 'Government',
      },
      {
        id: 4,
        name: 'Welfare and Compensation Scheme',
        description: 'Provides compensation and welfare benefits under law',
        type: 'Welfare',
      },
    ];

    res.status(200).json({
      success: true,
      data: schemes,
      message: 'Legal schemes retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving legal schemes',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
