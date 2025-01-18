import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma'; // Adjust the import based on your prisma setup

// Fetch all tenders or a specific tender by ID
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query;
    if (id) {
      try {
        const tender = await prisma.tender.findUnique({
          where: { id: String(id) },
        });
        if (tender) {
          return res.status(200).json(tender);
        } else {
          return res.status(404).json({ error: 'Tender not found' });
        }
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch tender' });
      }
    } else {
      try {
        const tenders = await prisma.tender.findMany();
        res.status(200).json(tenders);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tenders' });
      }
    }
  } else if (req.method === 'POST') {
    // Create a new tender
    const { title, description, sector, location, budget, closingDate } = req.body;

    try {
      const newTender = await prisma.tender.create({
        data: {
          title,
          description,
          sector,
          location,
          budget,
          closingDate,
        },
      });
      res.status(201).json(newTender);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create tender' });
    }
  } else if (req.method === 'PUT') {
    // Update an existing tender
    const { id, title, description, sector, location, budget, closingDate } = req.body;

    try {
      const updatedTender = await prisma.tender.update({
        where: { id },
        data: {
          title,
          description,
          sector,
          location,
          budget,
          closingDate,
        },
      });
      res.status(200).json(updatedTender);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update tender' });
    }
  } else if (req.method === 'DELETE') {
    // Delete a tender
    const { id } = req.query;

    try {
      await prisma.tender.delete({
        where: { id: String(id) },
      });
      res.status(204).end(); // No content
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete tender' });
    }
  } else if (req.method === 'PATCH') {
    // Change tender status
    const { id, status } = req.body;

    try {
      const updatedTender = await prisma.tender.update({
        where: { id },
        data: {
          status, // Assuming status is a field in your tender model
        },
      });
      res.status(200).json(updatedTender);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update tender status' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Fetch all tenders or a specific tender by ID
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query;
    if (id) {
      try {
        const tender = await prisma.tender.findUnique({
          where: { id: String(id) },
        });
        if (tender) {
          return res.status(200).json(tender);
        } else {
          return res.status(404).json({ error: 'Tender not found' });
        }
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch tender' });
      }
    } else {
      try {
        const tenders = await prisma.tender.findMany();
        res.status(200).json(tenders);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tenders' });
      }
    }
  } else if (req.method === 'POST') {
    // Create a new tender
    const { title, description, sector, location, budget, closingDate } = req.body;

    try {
      const newTender = await prisma.tender.create({
        data: {
          title,
          description,
          sector,
          location,
          budget,
          closingDate,
        },
      });
      res.status(201).json(newTender);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create tender' });
    }
  } else if (req.method === 'PUT') {
    // Update an existing tender
    const { id, title, description, sector, location, budget, closingDate } = req.body;

    try {
      const updatedTender = await prisma.tender.update({
        where: { id },
        data: {
          title,
          description,
          sector,
          location,
          budget,
          closingDate,
        },
      });
      res.status(200).json(updatedTender);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update tender' });
    }
  } else if (req.method === 'DELETE') {
    // Delete a tender
    const { id } = req.query;

    try {
      await prisma.tender.delete({
        where: { id: String(id) },
      });
      res.status(204).end(); // No content
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete tender' });
    }
  } else if (req.method === 'PATCH') {
    // Change tender status
    const { id, status } = req.body;

    try {
      const updatedTender = await prisma.tender.update({
        where: { id },
        data: {
          status, // Assuming status is a field in your tender model
        },
      });
      res.status(200).json(updatedTender);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update tender status' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query;
    if (id) {
      try {
        const tender = await prisma.tender.findUnique({
          where: { id: String(id) },
        });
        if (tender) {
          return res.status(200).json(tender);
        } else {
          return res.status(404).json({ error: 'Tender not found' });
        }
      } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch tender' });
      }
    } else {
      try {
        const tenders = await prisma.tender.findMany();
        res.status(200).json(tenders);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tenders' });
      }
    }
  } else if (req.method === 'POST') {
    // Submit a bid
    const { tenderId, bidderId, amount, technicalProposal } = req.body;

    try {
      const newBid = await prisma.bid.create({
        data: {
          tender: { connect: { id: tenderId } },
          bidder: { connect: { id: bidderId } },
          amount,
          technicalProposal,
        },
      });
      res.status(201).json(newBid);
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit bid' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}