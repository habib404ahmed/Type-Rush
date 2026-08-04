import { Event } from '../models/Event.js';

export const generateEventCode = async () => {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let isUnique = false;
  let code = '';

  while (!isUnique) {
    let randomChars = '';
    for (let i = 0; i < 6; i++) {
      randomChars += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    code = `TR${randomChars}`;

    const existingEvent = await Event.findOne({ eventCode: code });
    if (!existingEvent) {
      isUnique = true;
    }
  }

  return code;
};
