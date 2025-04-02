"use client";

import { Button } from "@/components/ui/button";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { githubLogIn, googleLogIn } from "@/lib/server-actions/auth";

const socialPlatforms = [
  { name: "Github", icon: FaGithub, login: githubLogIn },
  { name: "Google", icon: FaGoogle, login: googleLogIn },
];

const SocialLogin = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {socialPlatforms.map(({ name, icon: Icon, login }) => (
        <Button
          key={name}
          variant="outline"
          className="w-full flex items-center justify-center gap-2"
          onClick={login}
        >
          <Icon className="text-xl" />
          {name}
        </Button>
      ))}
    </div>
  );
};

export default SocialLogin;
