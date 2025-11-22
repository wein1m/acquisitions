import aj from '#config/arcjet.js';
import logger from '#config/logger.js';
import { slidingWindow } from '@arcjet/node';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';

    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin request limit exceeded! (20 per minute)';
        break;
      case 'user':
        limit = 10;
        message = 'User request limit exceeded! (10 per minute)';
        break;
      case 'guest':
        limit = 5;
        message = 'Guest request limit exceeded! (5 per minute)';
        break;
    }

    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: '1m',
        max: limit,
        name: `${role}-rate-limit`,
      })
    );

    const decision = await client.protect(req);

    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot request blocked~~ ', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });

      return res
        .status(403)
        .json({
          error: 'Forbidden',
          message: 'Automated requests are not allowed in my application!!',
        });
    }

    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield blocked request~~ ', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method
      });

      return res
        .status(403)
        .json({
          error: 'Forbidden',
          message: 'Request blocked by our security policy.',
        });
    }

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded~~ ', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });

      return res
        .status(403)
        .json({
          error: 'Forbidden',
          message: 'Rate limit exceeded.',
        });
    }

    next();
  } catch (error) {
    logger.error('The Arcjet Middleware errorrr!! ', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Somemthing is wrong with security middleware~!',
    });
    throw new Error('The Arcjet Middleware errorrr!! ', error);
  }
};

export default securityMiddleware;
