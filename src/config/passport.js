import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import logger from '../utils/logger.js';

const configurePassport = () => {
  // GitHub OAuth Strategy
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ['repo', 'user', 'read:org']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Store GitHub profile and tokens
      const githubUser = {
        githubId: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value,
        accessToken,
        refreshToken,
        profile: profile._json
      };

      logger.info(`GitHub user authenticated: ${profile.username}`);
      return done(null, githubUser);
    } catch (error) {
      logger.error('GitHub authentication error:', error);
      return done(error, null);
    }
  }));

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

  logger.info('Passport configuration completed');
};

export default configurePassport; 