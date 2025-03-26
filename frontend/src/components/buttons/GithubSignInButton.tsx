import { FaGithub } from "react-icons/fa";
import { Button } from "../ui/button";

const GithubSignInButton = () => {
  const loginWithGithub = () => console.log("login with GitHub");

  return (
    <Button
      color="teal"
      size="lg"
      className="w-full flex items-center justify-center mt-4"
      onClick={loginWithGithub}
    >
      <FaGithub className="mr-2" />
      Sign In with GitHub
    </Button>
  );
};

export default GithubSignInButton;
