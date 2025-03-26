import GoogleSignInButton from "../buttons/GoogleSignInButton";
import GithubSignInButton from "../buttons/GithubSignInButton";

const OAuthButtons = () => (
  <div className="w-full space-y-4">
    <GoogleSignInButton />
    <GithubSignInButton />
  </div>
);

export default OAuthButtons;
