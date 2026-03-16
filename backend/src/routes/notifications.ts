import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// Send notification to specific user
router.post('/send', async (req, res) => {
  try {
    const { userId, title, message, type, data } = req.body;

    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create notification in database
    const { data: notification, error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type: type || 'info',
        data: data || {},
      })
      .select()
      .single();

    if (notifError) throw notifError;

    // Get user's push tokens
    const { data: tokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('token')
      .eq('user_id', userId);

    if (tokenError) throw tokenError;

    // Send push notifications via Expo
    if (tokens && tokens.length > 0) {
      await sendExpoPushNotifications(tokens.map(t => t.token), title, message, data);
    }

    res.json({ success: true, notification });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send notification to multiple users (broadcast)
router.post('/broadcast', async (req, res) => {
  try {
    const { userIds, title, message, type, data } = req.body;

    if (!userIds || !Array.isArray(userIds) || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create notifications for all users
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type: type || 'info',
      data: data || {},
    }));

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notifError) throw notifError;

    // Get all push tokens for these users
    const { data: tokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('token')
      .in('user_id', userIds);

    if (tokenError) throw tokenError;

    // Send push notifications
    if (tokens && tokens.length > 0) {
      await sendExpoPushNotifications(tokens.map(t => t.token), title, message, data);
    }

    res.json({ success: true, count: userIds.length });
  } catch (error: any) {
    console.error('Error broadcasting notification:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send notification to all users with specific role
router.post('/broadcast-role', async (req, res) => {
  try {
    const { role, title, message, type, data } = req.body;

    if (!role || !title || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get all users with this role
    const { data: users, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', role);

    if (userError) throw userError;

    if (!users || users.length === 0) {
      return res.json({ success: true, count: 0 });
    }

    const userIds = users.map(u => u.id);

    // Create notifications
    const notifications = userIds.map(userId => ({
      user_id: userId,
      title,
      message,
      type: type || 'info',
      data: data || {},
    }));

    const { error: notifError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notifError) throw notifError;

    // Get push tokens
    const { data: tokens, error: tokenError } = await supabase
      .from('push_tokens')
      .select('token')
      .in('user_id', userIds);

    if (tokenError) throw tokenError;

    // Send push notifications
    if (tokens && tokens.length > 0) {
      await sendExpoPushNotifications(tokens.map(t => t.token), title, message, data);
    }

    res.json({ success: true, count: userIds.length });
  } catch (error: any) {
    console.error('Error broadcasting to role:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to send Expo push notifications
async function sendExpoPushNotifications(
  tokens: string[],
  title: string,
  body: string,
  data?: any
) {
  const messages = tokens
    .filter(token => token.startsWith('ExponentPushToken'))
    .map(token => ({
      to: token,
      sound: 'default',
      title,
      body,
      data: data || {},
    }));

  if (messages.length === 0) return;

  const chunks = chunkArray(messages, 100); // Expo allows max 100 notifications per request

  for (const chunk of chunks) {
    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chunk),
      });

      const result = await response.json();
      console.log('Expo push result:', result);
    } catch (error) {
      console.error('Error sending Expo push:', error);
    }
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export default router;
