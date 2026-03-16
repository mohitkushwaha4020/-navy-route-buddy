import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Get all active routes
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get route by bus id
router.get('/:busId', async (req: Request, res: Response) => {
  try {
    const { busId } = req.params;
    const { data, error } = await supabase
      .from('buses')
      .select('*')
      .eq('id', busId)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
