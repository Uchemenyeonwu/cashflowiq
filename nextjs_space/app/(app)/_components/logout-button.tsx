"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <Button
      onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
      variant="outline"
      className="w-full justify-start"
    >
      <LogOut className="w-5 h-5 mr-3" />
      Logout
    </Button>
  );
}
