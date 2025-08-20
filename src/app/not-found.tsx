import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="h-full flex flex-col items-center justify-center overflow-hidden space-y-4">
      <h1 className="text-4xl font-bold">404 – Not Found</h1>
      <p className="text-muted-foreground max-w-md">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <Button asChild>
        <Link href="/">Go back home</Link>
      </Button>
    </div>
  );
}
