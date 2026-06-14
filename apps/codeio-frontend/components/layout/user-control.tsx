"use client";

import { dark } from "@clerk/themes";
import { UserButton } from "@clerk/nextjs";

import { useCurrentTheme } from "@/features/shared/hooks/use-current-theme";

interface Props {
  showName?: boolean;
}

function UserControl({ showName = false }: Props) {
  const currentTheme = useCurrentTheme();

  return (
    <UserButton
      showName={showName}
      appearance={{
        elements: {
          userButtonBox: "rounded-md!",
          userButtonAvatarBox: "rounded-md! size-8!",
          userButtonTrigger: "rounded-md!",
        },
        baseTheme: currentTheme === "dark" ? dark : undefined,
      }}
    />
  );
}

export default UserControl;
