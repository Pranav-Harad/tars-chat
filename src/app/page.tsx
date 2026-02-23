import { Sidebar } from "@/components/Sidebar";

export default function Home() {
  return (
    <main className="flex h-[calc(100vh-65px)] w-full overflow-hidden bg-background">
      <div className="flex w-full h-full bg-background relative overflow-hidden">
        {/* Main empty chat area for desktop when no conversation is selected */}
        <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-muted/10 relative">
          <div className="text-center p-8 max-w-sm fade-in animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ring-1 ring-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary/70"
              >
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold mb-3 tracking-wide">Pran Chat</h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Select a conversation from the sidebar or search for a user to start messaging.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
