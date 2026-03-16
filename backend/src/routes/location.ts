import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { supabase } from '../lib/supabase';

const router = Router();

router.post('/update', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude, accuracy, speed } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data, error } = await supabase
      .from('locations')
      .upsert({
        user_id: userId,
        latitude,
        longitude,
        accuracy,
        speed,
        updated_at: new Date().toISOString()
      });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/driver/:driverId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { driverId } = req.params;

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('user_id', driverId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;