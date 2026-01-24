import { Request, Response } from 'express';

export const listCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = [
      {
        id: 1,
        name: 'Civil Law',
        description: 'Deals with disputes between individuals and organizations',
        subcategories: ['Contract Law', 'Property Law', 'Family Law', 'Tort Law'],
        icon: 'civil-law',
      },
      {
        id: 2,
        name: 'Criminal Law',
        description: 'Involves prosecution of crimes against society',
        subcategories: ['Theft', 'Assault', 'Murder', 'Fraud'],
        icon: 'criminal-law',
      },
      {
        id: 3,
        name: 'Consumer Law',
        description: 'Protects consumer rights and interests',
        subcategories: ['Product Liability', 'Warranty', 'Unfair Trade', 'Refund Rights'],
        icon: 'consumer-law',
      },
      {
        id: 4,
        name: 'Cyber Law',
        description: 'Regulates activities, rights and duties in cyberspace',
        subcategories: ['Data Protection', 'Hacking', 'Online Fraud', 'Cyberbullying'],
        icon: 'cyber-law',
      },
      {
        id: 5,
        name: 'Constitutional Law',
        description: 'Deals with the structure and powers of government',
        subcategories: ['Fundamental Rights', 'Duties', 'Directive Principles'],
        icon: 'constitutional-law',
      },
      {
        id: 6,
        name: 'Labor Law',
        description: 'Governs employment and labor relations',
        subcategories: ['Wages', 'Working Hours', 'Safety', 'Disputes'],
        icon: 'labor-law',
      },
    ];

    res.status(200).json({
      success: true,
      data: categories,
      message: 'Legal categories retrieved successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving legal categories',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
