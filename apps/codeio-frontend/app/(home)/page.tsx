import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div>Home Page</div>
      <div className="flex gap-1">
        <Button>Signup</Button>
        <Button>Login</Button>
      </div>
    </div>
  );
}
