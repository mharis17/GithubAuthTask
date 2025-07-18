import Commit from './Commit.js';
import GitHubUser from './GitHubUser.js';
import Integration from './Integration.js';
import Issue from './Issue.js';
import IssueChangelog from './IssueChangelog.js';
import Organization from './Organization.js';
import PullRequest from './PullRequest.js';
import Repository from './Repository.js';

// Map of collection/entity names to Mongoose models
const models = {
  commits: Commit,
  github_users: GitHubUser,
  integrations: Integration,
  issues: Issue,
  issue_changelogs: IssueChangelog,
  organizations: Organization,
  pull_requests: PullRequest,
  repositories: Repository,
};

export default models; 