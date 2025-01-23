import GoogleSignInButton from './GoogleSignInButton';
import GithubSignInButton from './GithubSignInButton';

const OAuthButtons = () => (
  <div className="w-full space-y-4">
    <GoogleSignInButton />
    <GithubSignInButton />
  </div>
);

export default OAuthButtons;
