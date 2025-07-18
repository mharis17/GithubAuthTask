import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import logger from '../../utils/logger.js';

const configurePassport = () => {
  // Check if GitHub OAuth credentials are configured
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    logger.warn('GitHub OAuth credentials not configured.');
    return;
  }

  // GitHub OAuth Strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/api/auth/github/callback',
    scope: ['repo', 'user', 'read:org']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      console.log('GitHub OAuth callback triggered');
      console.log('Profile received from GitHub:', profile);
      console.log('AccessToken:', accessToken);
      console.log('RefreshToken:', refreshToken);
      // Store GitHub profile and tokens (use snake_case for Integration model compatibility)
      const githubUser = {
        github_id: Number(profile.id), // Ensure this is always a number
        username: profile.username,
        display_name: profile.displayName,
        email: profile.emails?.[0]?.value,
        access_token: accessToken,
        refresh_token: refreshToken,
        profile: profile._json
      };
      console.log('githubUser object to be passed to done():', githubUser);

      logger.info(`GitHub user authenticated: ${profile.username}`);
      return done(null, githubUser);
    } catch (error) {
      logger.error('GitHub authentication error:', error);
      console.log('Error in GitHub OAuth callback:', error);
      return done(error, null);
    }
  }));

  // Serialize user for session (store only github_id as Number)
  passport.serializeUser((user, done) => {
    console.log('serializeUser called with:', user);
    done(null, Number(user.github_id));
  });

  // Deserialize user from session (fetch from Integration model using Number)
  passport.deserializeUser(async (github_id, done) => {
    try {
      const Integration = (await import('../models/Integration.js')).default;
      const integration = await Integration.findOne({ github_id: Number(github_id) });
      if (integration) {
        done(null, {
          github_id: integration.github_id,
          username: integration.username,
          display_name: integration.display_name,
          email: integration.email,
          status: integration.status
        });
      } else {
        done(null, false);
      }
    } catch (err) {
      done(err, null);
    }
  });

  logger.info('Passport configuration completed');
};

export default configurePassport; 