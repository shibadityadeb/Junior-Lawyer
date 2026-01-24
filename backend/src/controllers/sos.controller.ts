import { Request, Response } from 'express';

export const listSOSHelp = async (req: Request, res: Response): Promise<void> => {
  try {
    const sosHelp = [
      {
        id: 1,
        category: 'Civil',
        title: 'Domestic Violence Legal Help',
        description: 'Emergency legal assistance for domestic violence cases',
        hotline: '1097',
        helplineNumber: '+91-1097',
      },
      {
        id: 2,
        category: 'Criminal',
        title: 'Criminal Justice Emergency',
        description: 'Immediate legal support for criminal cases',
        hotline: '1090',
        helplineNumber: '+91-1090',
      },
      {
        id: 3,
        category: 'Cyber',
        title: 'Cyber Crime Legal Support',
        description: 'Emergency help for cyber crimes and digital harassment',
        hotline: '1930',
        helplineNumber: '+91-1930',
      },
      {
        id: 4,
        category: 'Civil',
        title: 'Property Dispute Resolution',
        description: 'Legal guidance for property-related emergencies',
        helplineNumber: 'Consult local legal aid center',
      },
      {
        id: 5,
        category: 'Criminal',
        title: 'Women Protection Act Support',
        description: 'Legal help under Protection of Women from Domestic Violence Act',
        hotline: '1091',
        helplineNumber: '+91-1091',
      },
    ];

    res.status(200).json({
      success: true,
      data: sosHelp,
      message: 'SOS legal help information retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving SOS help information',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
