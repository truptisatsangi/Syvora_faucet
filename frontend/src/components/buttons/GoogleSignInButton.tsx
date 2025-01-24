import { FaGoogle } from "react-icons/fa";
import { Button } from '../ui/button';

const GoogleSignInButton = () => {
    const loginWithGoogle = () => console.log('login with google');

    return (
        <Button color="teal" size="lg" className="w-full flex items-center justify-center" onClick={loginWithGoogle}>
            <FaGoogle className="mr-2" />
            Sign In with Google
        </Button>
    );
};

export default GoogleSignInButton;