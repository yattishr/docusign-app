import { LinkAccountButton } from "@/components/ui/link-account-button";

export default async function Home() {
  return (
    <div className="items-center">
      <div className="text-4xl font-bold items-center ml-auto">Hello World</div>
      <LinkAccountButton />
    </div>
  );
}
